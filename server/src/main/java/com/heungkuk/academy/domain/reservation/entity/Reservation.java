package com.heungkuk.academy.domain.reservation.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.heungkuk.academy.domain.reservation.dto.request.ReservationRequest;
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
@Table(name = "reservation")
public class Reservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_code", length = 20, unique = true, nullable = false)
    private String reservationCode;

    @Column(length = 100, nullable = false)
    private String organization;

    @Column(length = 255, nullable = false)
    private String purpose;

    @Column()
    private Integer people;

    @Column(length = 50, nullable = false)
    private String customer;

    @Column(name = "customer_phone", length = 20, nullable = false)
    private String customerPhone;

    @Column(name = "customer_phone2", length = 20)
    private String customerPhone2;

    @Column(name = "customer_email", length = 100, nullable = false)
    private String customerEmail;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "color_code", length = 10, nullable = false)
    private String colorCode;

    // 확정 / 대기 / 취소
    @Column(length = 20, nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String memo;


    public static Reservation from(ReservationRequest request, String reservationCode) {
        return Reservation.builder()
                .reservationCode(reservationCode)
                .organization(request.getOrganization())
                .purpose(request.getPurpose())
                .people(request.getPeople())
                .customer(request.getCustomer())
                .customerPhone(request.getCustomerPhone())
                .customerPhone2(request.getCustomerPhone2())
                .customerEmail(request.getCustomerEmail())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .colorCode(request.getColorCode())
                .status(request.getStatus())
                .memo(request.getMemo())
                .build();
    }

    // Reservation
    public void update(ReservationRequest request){
        this.organization = request.getOrganization();
        this.purpose = request.getPurpose();
        this.people = request.getPeople();
        this.customer = request.getCustomer();
        this.customerPhone = request.getCustomerPhone();
        this.customerPhone2 = request.getCustomerPhone2();
        this.customerEmail = request.getCustomerEmail();
        this.startDate = request.getStartDate();
        this.endDate = request.getEndDate();
        this.colorCode = request.getColorCode();
        this.status = request.getStatus();
        this.memo = request.getMemo();
    }

    public void updateStatus(String status) {
        this.status = status;
    }
}
