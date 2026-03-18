package com.heungkuk.academy.domain.reservation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.heungkuk.academy.domain.reservation.entity.MealReservation;
import com.heungkuk.academy.domain.reservation.entity.Reservation;

public interface MealReservationRepository extends JpaRepository<MealReservation, Long>{
    List<MealReservation> findByReservation(Reservation reservation);
    void deleteByReservation(Reservation reservation);
}
