package com.heungkuk.academy.domain.setting.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
public class SettingRequest {
    private Map<String, String> settings;
}
