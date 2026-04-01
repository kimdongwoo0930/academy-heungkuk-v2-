package com.heungkuk.academy.domain.reservation.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(name = "reservation", indexes = {
        @Index(name = "idx_reservation_dates", columnList = "start_date, end_date")
})
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

    @Column(name = "인원수")
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

    @Column(name = "company_address", length = 255)
    private String companyAddress;

    @Column(name = "site_manager", length = 50)
    private String siteManager;

    @Column(name = "site_manager_phone", length = 20)
    private String siteManagerPhone;

    @Column(columnDefinition = "TEXT")
    private String memo;

    public static Reservation from(ReservationRequest request, String reservationCode) {
        return Reservation.builder().reservationCode(reservationCode)
                .organization(request.getOrganization()).purpose(request.getPurpose())
                .people(request.getPeople()).customer(request.getCustomer())
                .customerPhone(request.getCustomerPhone())
                .customerPhone2(request.getCustomerPhone2())
                .customerEmail(request.getCustomerEmail()).startDate(request.getStartDate())
                .endDate(request.getEndDate()).colorCode(request.getColorCode())
                .status(request.getStatus()).companyAddress(request.getCompanyAddress())
                .siteManager(request.getSiteManager())
                .siteManagerPhone(request.getSiteManagerPhone()).memo(request.getMemo()).build();
    }

    // Reservation
    public void update(ReservationRequest request) {
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
        this.companyAddress = request.getCompanyAddress();
        this.siteManager = request.getSiteManager();
        this.siteManagerPhone = request.getSiteManagerPhone();
        this.memo = request.getMemo();
    }

    public void updateStatus(String status) {
        this.status = status;
    }

    /** Excel import 전용 — reservation_code가 없는 신규 행 생성 */
    public static Reservation fromImport(String code, String organization, String purpose,
            Integer people, String customer, String customerPhone, String customerPhone2,
            String customerEmail, LocalDate startDate, LocalDate endDate,
            String colorCode, String status, String companyAddress,
            String siteManager, String siteManagerPhone, String memo) {
        return Reservation.builder().reservationCode(code).organization(organization)
                .purpose(purpose).people(people).customer(customer)
                .customerPhone(customerPhone)
                .customerPhone2(customerPhone2 != null && customerPhone2.isBlank() ? null : customerPhone2)
                .customerEmail(customerEmail).startDate(startDate).endDate(endDate)
                .colorCode(colorCode).status(status)
                .companyAddress(companyAddress != null && companyAddress.isBlank() ? null : companyAddress)
                .siteManager(siteManager != null && siteManager.isBlank() ? null : siteManager)
                .siteManagerPhone(siteManagerPhone != null && siteManagerPhone.isBlank() ? null : siteManagerPhone)
                .memo(memo != null && memo.isBlank() ? null : memo).build();
    }

    /** Excel import 전용 — 기존 예약 필드 업데이트 */
    public void updateFromImport(String organization, String purpose, Integer people,
            String customer, String customerPhone, String customerPhone2, String customerEmail,
            LocalDate startDate, LocalDate endDate, String colorCode, String status,
            String companyAddress, String siteManager, String siteManagerPhone, String memo) {
        this.organization = organization;
        this.purpose = purpose;
        this.people = people;
        this.customer = customer;
        this.customerPhone = customerPhone;
        this.customerPhone2 = customerPhone2 != null && customerPhone2.isBlank() ? null : customerPhone2;
        this.customerEmail = customerEmail;
        this.startDate = startDate;
        this.endDate = endDate;
        this.colorCode = colorCode;
        this.status = status;
        this.companyAddress = companyAddress != null && companyAddress.isBlank() ? null : companyAddress;
        this.siteManager = siteManager != null && siteManager.isBlank() ? null : siteManager;
        this.siteManagerPhone = siteManagerPhone != null && siteManagerPhone.isBlank() ? null : siteManagerPhone;
        this.memo = memo != null && memo.isBlank() ? null : memo;
    }
}
