package com.heungkuk.academy.domain.setting.controller;

import com.heungkuk.academy.domain.setting.dto.SettingRequest;
import com.heungkuk.academy.domain.setting.service.AppSettingService;
import com.heungkuk.academy.global.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/admin/settings")
@RequiredArgsConstructor
public class AppSettingController {

    private final AppSettingService appSettingService;

    @GetMapping
    public CommonResponse<Map<String, String>> getSettings() {
        return CommonResponse.success(appSettingService.getAll());
    }

    @PutMapping
    public CommonResponse<Void> saveSettings(@RequestBody SettingRequest request) {
        appSettingService.saveAll(request.getSettings());
        return CommonResponse.success("저장되었습니다.", null);
    }
}
