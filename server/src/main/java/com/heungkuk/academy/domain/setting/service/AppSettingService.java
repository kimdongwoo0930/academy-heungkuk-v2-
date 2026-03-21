package com.heungkuk.academy.domain.setting.service;

import com.heungkuk.academy.domain.setting.entity.AppSetting;
import com.heungkuk.academy.domain.setting.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppSettingService {

    private final AppSettingRepository appSettingRepository;

    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        return appSettingRepository.findAll().stream()
                .collect(Collectors.toMap(AppSetting::getSettingKey, AppSetting::getSettingValue));
    }

    @Transactional
    public void saveAll(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            appSettingRepository.findBySettingKey(entry.getKey())
                    .ifPresentOrElse(
                            s -> s.updateValue(entry.getValue()),
                            () -> appSettingRepository.save(AppSetting.of(entry.getKey(), entry.getValue()))
                    );
        }
    }
}
