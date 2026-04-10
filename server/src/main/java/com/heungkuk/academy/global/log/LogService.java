package com.heungkuk.academy.global.log;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LogService {

    // 로그 파일이 저장되는 디렉토리 (logback-spring.xml의 LOG_DIR과 일치해야 함)
    private static final String LOG_DIR = "logs";

    // 허용된 파일 이름 목록 — 경로 조작 공격 방지
    private static final List<String> ALLOWED_FILES =
            List.of("app", "auth", "reservation", "access", "error");

    // 파일별 구독자(SseEmitter) 목록
    // ConcurrentHashMap: 멀티스레드 환경에서 안전하게 파일 키를 관리
    // CopyOnWriteArrayList: 브로드캐스트 도중 구독자가 추가/제거되어도 안전
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    // ─────────────────────────────────────────────────
    // 1. 파일 끝에서 N줄 읽기 (초기 로드용)
    // ─────────────────────────────────────────────────
    public List<String> readLastLines(String fileName, int lineCount) {
        if (!ALLOWED_FILES.contains(fileName))
            return List.of();

        Path path = Paths.get(LOG_DIR, fileName + ".log");
        if (!Files.exists(path))
            return List.of();

        try (RandomAccessFile raf = new RandomAccessFile(path.toFile(), "r")) {
            long fileLength = raf.length();
            if (fileLength == 0)
                return List.of();

            // 1. 파일 끝에서 역방향으로 '\n' 개수를 세서 시작 위치를 찾는다
            // (0x0A는 UTF-8 멀티바이트 시퀀스 내부에 절대 등장하지 않으므로 안전)
            long pos = fileLength - 1;
            int newLineCount = 0;
            while (pos >= 0 && newLineCount < lineCount) {
                raf.seek(pos);
                if (raf.readByte() == '\n')
                    newLineCount++;
                pos--;
            }

            // 2. 시작 위치 결정 (pos-- 두 번 반영, 최소 0)
            long startPos = Math.max(0, pos + 2);
            raf.seek(startPos);

            // 3. 시작 위치부터 파일 끝까지 바이트를 한꺼번에 읽어 UTF-8 디코딩
            int remaining = (int) (fileLength - startPos);
            byte[] bytes = new byte[remaining];
            raf.readFully(bytes);
            String content = new String(bytes, StandardCharsets.UTF_8);

            // 4. 빈 줄 제거 후 반환
            List<String> result = new ArrayList<>();
            for (String line : content.split("\n")) {
                String trimmed = line.stripTrailing();
                if (!trimmed.isBlank())
                    result.add(trimmed);
            }
            return result;

        } catch (IOException e) {
            log.warn("로그 파일 읽기 실패: {}", fileName, e);
            return List.of();
        }
    }

    // ─────────────────────────────────────────────────
    // 2. 클라이언트 SSE 구독 등록
    // ─────────────────────────────────────────────────
    public SseEmitter subscribe(String fileKey) {
        if (!ALLOWED_FILES.contains(fileKey)) {
            // 허용되지 않은 파일 키 → 즉시 완료 처리
            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }

        // 30분 타임아웃 (0L = 무제한이지만 nginx keepalive 고려해 30분으로 설정)
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        // 해당 파일 키의 구독자 목록에 추가
        emitters.computeIfAbsent(fileKey, k -> new CopyOnWriteArrayList<>()).add(emitter);

        // 연결 종료/타임아웃 시 목록에서 제거
        emitter.onCompletion(() -> removeEmitter(fileKey, emitter));
        emitter.onTimeout(() -> removeEmitter(fileKey, emitter));
        emitter.onError(e -> removeEmitter(fileKey, emitter));

        // 연결 즉시 ping 전송 → 클라이언트 onopen 즉시 발화
        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException e) {
            emitter.completeWithError(e);
            return emitter;
        }

        log.info("로그 SSE 구독 등록: file={}, 현재 구독자 수={}", fileKey,
                emitters.getOrDefault(fileKey, List.of()).size());
        return emitter;
    }

    private void removeEmitter(String fileKey, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(fileKey);
        if (list != null)
            list.remove(emitter);
    }

    // ─────────────────────────────────────────────────
    // 3. 파일 변경 폴링 시작 (앱 시작 시 한 번만 실행)
    // WatchService(inotify)는 Docker overlayfs에서 불안정 → 500ms 폴링으로 대체
    // ─────────────────────────────────────────────────
    @PostConstruct
    public void startWatching() {
        Path logDir = Paths.get(LOG_DIR);

        if (!Files.exists(logDir)) {
            log.info("logs/ 디렉토리 없음 — 파일 감시 생략");
            return;
        }

        Map<String, Long> lastPositions = new ConcurrentHashMap<>();

        Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "log-poller");
            t.setDaemon(true);
            return t;
        }).scheduleAtFixedRate(() -> {
            for (String fileKey : ALLOWED_FILES) {
                if (!emitters.containsKey(fileKey) || emitters.get(fileKey).isEmpty())
                    continue;
                sendNewLines(fileKey, lastPositions);
            }
        }, 500, 500, TimeUnit.MILLISECONDS);

        log.info("로그 파일 폴링 시작 (500ms 간격): {}", logDir.toAbsolutePath());
    }

    // ─────────────────────────────────────────────────
    // 4. 마지막 위치 이후 새로 추가된 줄만 읽어서 브로드캐스트
    // ─────────────────────────────────────────────────
    private void sendNewLines(String fileKey, Map<String, Long> lastPositions) {
        Path path = Paths.get(LOG_DIR, fileKey + ".log");
        // 마지막으로 읽은 바이트 위치 (없으면 파일 끝 → 새 줄만 전송)
        long lastPos = lastPositions.getOrDefault(fileKey, -1L);

        try (RandomAccessFile raf = new RandomAccessFile(path.toFile(), "r")) {
            // 처음 연결이면 파일 끝 위치부터 시작 (기존 로그 중복 방지)
            if (lastPos == -1L) {
                lastPositions.put(fileKey, raf.length());
                return;
            }

            raf.seek(lastPos);
            String rawLine;
            // readLine()은 ISO-8859-1로 읽으므로 UTF-8로 재변환 필요
            while ((rawLine = raf.readLine()) != null) {
                String line = new String(rawLine.getBytes(StandardCharsets.ISO_8859_1),
                        StandardCharsets.UTF_8);
                if (!line.isBlank())
                    broadcast(fileKey, line);
            }
            // 현재 파일 포인터 위치 저장 (다음 이벤트 때 여기서부터 읽음)
            lastPositions.put(fileKey, raf.getFilePointer());

        } catch (IOException e) {
            log.warn("새 로그 읽기 실패: {}", fileKey, e);
        }
    }

    // ─────────────────────────────────────────────────
    // 5. 해당 파일 구독자 전체에게 새 줄 전송
    // ─────────────────────────────────────────────────
    private void broadcast(String fileKey, String line) {
        List<SseEmitter> list = emitters.get(fileKey);
        if (list == null || list.isEmpty())
            return;

        // 전송 실패한 emitter(연결 끊김)는 목록에서 제거
        list.removeIf(emitter -> {
            try {
                emitter.send(SseEmitter.event().data(line));
                return false; // 성공 → 유지
            } catch (Exception e) {
                return true; // 실패 → 제거
            }
        });
    }
}
