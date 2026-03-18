package com.heungkuk.academy.domain.reservation.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.heungkuk.academy.domain.reservation.dto.request.MealRequest;
import com.heungkuk.academy.global.entity.BaseTimeEntity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
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

    public static MealReservation of(Reservation reservation, MealRequest request) {
    return MealReservation.builder()
            .reservation(reservation)
            .mealDate(request.getReservedDate())
            .breakfast(request.getBreakfast())
            .lunch(request.getLunch())
            .dinner(request.getDinner())
            .build();
}

}
