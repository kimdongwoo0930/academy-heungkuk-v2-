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
import com.heungkuk.academy.domain.reservation.dto.request.ClassroomRequest;
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
@Table(name = "classroom_reservation")
public class ClassroomReservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(length = 10, nullable = false)
    private String classroom;

    @Column(name = "reserved_date", nullable = false)
    private LocalDate reservedDate;

    public static ClassroomReservation of(Reservation reservation, ClassroomRequest request) {
        return ClassroomReservation.builder().reservation(reservation)
                .classroom(request.getClassroomName()).reservedDate(request.getReservedDate())
                .build();
    }

}
