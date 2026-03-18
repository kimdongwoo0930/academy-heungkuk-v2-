package com.heungkuk.academy.domain.reservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.heungkuk.academy.domain.reservation.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long>{


    @Query(value = "SELECT COUNT(*) FROM reservation WHERE reservation_code LIKE CONCAT(:prefix, '%')", nativeQuery = true)
    int countByCodePrefix(@Param("prefix") String prefix);


}
