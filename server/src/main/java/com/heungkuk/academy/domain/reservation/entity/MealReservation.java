package com.heungkuk.academy.domain.reservation.entity;

import com.heungkuk.academy.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "meal_reservation")
public class MealReservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    private Integer breakfast;

    private Integer lunch;

    private Integer dinner;
}
