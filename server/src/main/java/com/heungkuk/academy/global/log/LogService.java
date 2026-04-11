package com.heungkuk.academy.global.log;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;
// import java.util.concurrent.CopyOnWriteArrayList;
// import java.util.concurrent.Executors;
// import java.util.concurrent.TimeUnit;
// import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
// import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LogService {

    // 로그 파일이 저장되는 디렉토리 (logback-spring.xml의 LOG_DIR과 일치해야 함)
    private static final String LOG_DIR = "logs";

    // 허용된 파일 이름 목록 — 경로 조작 공격 방지
    private static final List<String> ALLOWED_FILES =
            List.of("app", "auth", "reservation", "access", "error");

    // SSE 구독자 목록 — Grafana + Loki로 대체되어 비활성화
    // private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

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
    // 2~5. SSE 구독/폴링/브로드캐스트 — Grafana + Loki로 대체되어 비활성화
    // ─────────────────────────────────────────────────

    // public SseEmitter subscribe(String fileKey) { ... }
    // private void removeEmitter(String fileKey, SseEmitter emitter) { ... }

    // @PostConstruct
    // public void startWatching() { ... }

    // private void sendNewLines(String fileKey, Map<String, Long> lastPositions) { ... }
    // private void broadcast(String fileKey, String line) { ... }
}
