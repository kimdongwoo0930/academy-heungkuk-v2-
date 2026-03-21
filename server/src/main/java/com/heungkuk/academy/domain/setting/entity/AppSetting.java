package com.heungkuk.academy.domain.setting.entity;

import com.heungkuk.academy.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "app_setting")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AppSetting extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(name = "setting_value", nullable = false, length = 500)
    private String settingValue;

    public static AppSetting of(String key, String value) {
        return AppSetting.builder()
                .settingKey(key)
                .settingValue(value)
                .build();
    }

    public void updateValue(String value) {
        this.settingValue = value;
    }
}
