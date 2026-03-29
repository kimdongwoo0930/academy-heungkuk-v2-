package com.heungkuk.academy.domain.setting.service;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.heungkuk.academy.domain.setting.entity.AppSetting;
import com.heungkuk.academy.domain.setting.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppSettingServiceImpl implements AppSettingService {

    private final AppSettingRepository appSettingRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        return appSettingRepository.findAll().stream()
                .collect(Collectors.toMap(AppSetting::getSettingKey, AppSetting::getSettingValue));
    }

    @Override
    @Transactional
    public void saveAll(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            appSettingRepository.findBySettingKey(entry.getKey()).ifPresentOrElse(
                    s -> s.updateValue(entry.getValue()), () -> appSettingRepository
                            .save(AppSetting.of(entry.getKey(), entry.getValue())));
        }
    }
}
