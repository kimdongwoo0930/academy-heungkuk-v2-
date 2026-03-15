package com.heungkuk.academy.domain.reservation.entity;

import com.heungkuk.academy.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;


@Getter
@Entity
@Table(name = "classroom_reservation")
public class ClassroomReservation extends BaseTimeEntity {

    // PK: id (BIGINT, AUTO_INCREMENT)

    // reservation: FK → Reservation — @ManyToOne, FetchType.LAZY

    // classroom: VARCHAR(10), NOT NULL — 강의실 호실 ex) "105", "201", "A"

    // reserved_date: DATE, NOT NULL — 예약 날짜 → LocalDate 사용

    // start_time: TIME, NOT NULL — 시작 시간 → LocalTime 사용

    // end_time: TIME, NOT NULL — 종료 시간 → LocalTime 사용

    // created_at, updated_at → BaseTimeEntity 가 자동 처리
}
