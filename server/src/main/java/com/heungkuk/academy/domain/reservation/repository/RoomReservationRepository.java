package com.heungkuk.academy.domain.reservation.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.heungkuk.academy.domain.reservation.entity.Reservation;
import com.heungkuk.academy.domain.reservation.entity.RoomReservation;

public interface RoomReservationRepository extends JpaRepository<RoomReservation, Long>{
// 날짜 범위 안에 이미 예약된 호수 목록 조회
@Query("SELECT r.roomNumber FROM RoomReservation r WHERE r.reservedDate BETWEEN :startDate AND :endDate AND r.reservation.status != '취소'")
List<String> findReservedRoomNumbers(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

List<RoomReservation> findByReservation(Reservation reservation);
void deleteByReservation(Reservation reservation);
}
