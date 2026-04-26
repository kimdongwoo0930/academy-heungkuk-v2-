package com.heungkuk.academy.domain.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.heungkuk.academy.domain.dashboard.dto.response.DashboardResponse;
import com.heungkuk.academy.domain.dashboard.service.DashboardService;
import com.heungkuk.academy.global.response.CommonResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "대시보드 API")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "대시보드 데이터 조회")
    @GetMapping("/v1/admin/dashboard")
    public ResponseEntity<CommonResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(CommonResponse.success(dashboardService.getDashboard()));
    }
}
