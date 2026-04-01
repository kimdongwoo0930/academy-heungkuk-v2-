package com.heungkuk.academy.domain.reservation.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.heungkuk.academy.domain.reservation.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

  Optional<Reservation> findByReservationCode(String reservationCode);

  @Query(value = "SELECT COUNT(*) FROM reservation WHERE reservation_code LIKE CONCAT(:prefix, '%')", nativeQuery = true)
  int countByCodePrefix(@Param("prefix") String prefix);

  @Query("SELECT r FROM Reservation r WHERE r.startDate <= :endOfYear AND r.endDate >= :startOfYear")
  List<Reservation> findByDateRange(@Param("startOfYear") LocalDate startOfYear,
      @Param("endOfYear") LocalDate endOfYear);

  @Query(value = """
      SELECT r FROM Reservation r
      WHERE (:keyword IS NULL OR r.organization LIKE %:keyword% OR r.customer LIKE %:keyword%)
        AND (:status IS NULL OR r.status = :status)
        AND (:startDate IS NULL OR r.startDate >= :startDate)
        AND (:endDate IS NULL OR r.endDate <= :endDate)
      """, countQuery = """
      SELECT COUNT(r) FROM Reservation r
      WHERE (:keyword IS NULL OR r.organization LIKE %:keyword% OR r.customer LIKE %:keyword%)
        AND (:status IS NULL OR r.status = :status)
        AND (:startDate IS NULL OR r.startDate >= :startDate)
        AND (:endDate IS NULL OR r.endDate <= :endDate)
      """)
  Page<Reservation> search(@Param("keyword") String keyword, @Param("status") String status,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate, Pageable pageable);

}
