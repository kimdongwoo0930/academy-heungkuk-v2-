package com.heungkuk.academy.domain.reservation.entity;

import com.heungkuk.academy.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;


@Getter
@Entity
@Table(name = "room_reservation")
public class RoomReservation extends BaseTimeEntity {

    // PK: id (BIGINT, AUTO_INCREMENT)

    // reservation: FK → Reservation — @ManyToOne, FetchType.LAZY

    // room_number: VARCHAR(10), NOT NULL — 객실 호수 ex) "101", "209"

    // reserved_date: DATE, NOT NULL — 숙박 날짜 → LocalDate 사용

    // check_in_time: TIME, NULL — 체크인 시간 (첫날만) → LocalTime 사용

    // check_out_time: TIME, NULL — 체크아웃 시간 (마지막날만) → LocalTime 사용

    // created_at, updated_at → BaseTimeEntity 가 자동 처리
}
