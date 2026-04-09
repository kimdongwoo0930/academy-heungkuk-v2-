package com.heungkuk.academy.domain.reservation.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.heungkuk.academy.domain.reservation.entity.ClassroomReservation;
import com.heungkuk.academy.domain.reservation.entity.Reservation;

public interface ClassroomReservationRepository extends JpaRepository<ClassroomReservation, Long> {
       List<ClassroomReservation> findByReservation(Reservation reservation);

       void deleteByReservation(Reservation reservation);

       @Query("SELECT COUNT(c) > 0 FROM ClassroomReservation c " + "WHERE c.classroom = :classroom "
                     + "AND c.reservedDate = :date " + "AND c.reservation.status != '취소'")
       boolean existsConflict(@Param("classroom") String classroom, @Param("date") LocalDate date);


       List<ClassroomReservation> findByReservationIn(List<Reservation> reservations);

}
