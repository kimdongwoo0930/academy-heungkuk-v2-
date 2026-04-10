package com.heungkuk.academy.global.log;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.heungkuk.academy.global.response.CommonResponse;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    // 초기 로그 로드 — 파일 끝에서 최근 N줄 반환
    // GET /v1/admin/logs?file=app&lines=100
    @GetMapping
    public ResponseEntity<CommonResponse<List<String>>> getLogs(
            @RequestParam(defaultValue = "app") String file,
            @RequestParam(defaultValue = "100") int lines
    ) {
        List<String> result = logService.readLastLines(file, lines);
        return ResponseEntity.ok(CommonResponse.success(result));
    }

    // SSE 실시간 스트림 — 연결 유지하며 새 로그 수신
    // GET /v1/admin/logs/stream?file=app
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogs(
            @RequestParam(defaultValue = "app") String file,
            HttpServletResponse response
    ) {
        // NGINX가 SSE 응답을 버퍼링하지 않도록 지시
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");
        return logService.subscribe(file);
    }
}
