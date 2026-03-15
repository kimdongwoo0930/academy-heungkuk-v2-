package com.heungkuk.academy.domain.reservation.entity;

import com.heungkuk.academy.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;


@Getter
@Entity
@Table(name = "reservation")
public class Reservation extends BaseTimeEntity {

    // PK: id (BIGINT, AUTO_INCREMENT)

    // reservation_code: VARCHAR(20), UNIQUE, NOT NULL — 예약 고유번호 ex) HK-20260313-001

    // organization: VARCHAR(100), NOT NULL — 단체명

    // purpose: VARCHAR(255), NOT NULL — 연수 목적

    // people: INT, NOT NULL — 총 인원

    // customer: VARCHAR(50), NOT NULL — 담당자 이름

    // customer_phone: VARCHAR(20), NOT NULL — 담당자 연락처

    // customer_phone2: VARCHAR(20), NULL — 담당자 연락처2

    // customer_email: VARCHAR(100), NULL — 담당자 이메일

    // start_date: DATE, NOT NULL — 시작일 → LocalDate 사용

    // end_date: DATE, NOT NULL — 종료일 → LocalDate 사용

    // color_code: VARCHAR(10), NOT NULL — 캘린더 색상 ex) #FF5733

    // status: VARCHAR(20), NOT NULL — "확정" / "대기" / "취소"

    // memo: TEXT, NULL — 특이사항

    // created_at, updated_at → BaseTimeEntity 가 자동 처리
}
