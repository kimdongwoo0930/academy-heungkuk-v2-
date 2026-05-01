package com.heungkuk.academy.domain.setting.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.heungkuk.academy.global.entity.BaseTimeEntity;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 애플리케이션 공통 설정 (key-value 구조)
 *
 * ── 요금 설정 ────────────────────────────────────────────────────────────────
 * price.room                  숙박비 단가 (원/실·박)           기본: 85000
 * price.meal                  식비 단가 - 일반식 (원/식)       기본: 8300
 * price.specialMeal           식비 단가 - 특식 (원/식)         기본: 35000
 * price.classroom.대형(120인)  강의실 요금 (원/일)              기본: 1200000
 * price.classroom.중형(70인)   강의실 요금 (원/일)              기본: 560000
 * price.classroom.중형(50인)   강의실 요금 (원/일)              기본: 400000
 * price.classroom.소형(30인)   강의실 요금 (원/일)              기본: 240000
 * price.classroom.소형(20인)   강의실 요금 (원/일)              기본: 160000
 * price.classroom.분임실(12인) 강의실 요금 (원/일)              기본: 96000
 * price.classroom.다목적실     강의실 요금 (원/일)              기본: 250000
 *
 * ── 연수원 담당자 정보 (견적서 헤더에 출력) ───────────────────────────────────
 * contact.representative      대표이사명                        기본: 이름
 * contact.manager             담당 소장명                       기본: 이름
 * contact.phone               대표 전화번호                     기본: 031-283-6157
 * contact.fax                 팩스 번호                         기본: 031-284-5323
 * contact.email               이메일 주소                       기본: hka6157@naver.com
 *
 * ── 사용 불가 강의실 여부  ─────────────────────────────────────────────────
 * disabledClassroom           사용불가능한 강의실                  [ 101, 105, 10 ]
 */
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
