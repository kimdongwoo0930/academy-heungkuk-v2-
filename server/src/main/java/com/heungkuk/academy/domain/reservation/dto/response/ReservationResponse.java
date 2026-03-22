package com.heungkuk.academy.domain.reservation.dto.response;

import com.heungkuk.academy.domain.reservation.entity.Reservation;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "예약 응답")
@Getter
@Builder
public class ReservationResponse {

    @Schema(description = "예약 ID", example = "1")
    private Long id;
    @Schema(description = "예약 코드", example = "RES-20260401-001")
    private String reservationCode;
    @Schema(description = "단체명", example = "삼성생명 연수팀")
    private String organization;
    @Schema(description = "연수 목적", example = "신입사원 교육")
    private String purpose;
    @Schema(description = "총 인원", example = "30")
    private Integer people;

    @Schema(description = "담당자명", example = "홍길동")
    private String customer;
    @Schema(description = "담당자 연락처", example = "010-1234-5678")
    private String customerPhone;
    @Schema(description = "담당자 연락처2", example = "02-1234-5678")
    private String customerPhone2;
    @Schema(description = "담당자 이메일", example = "hong@samsung.com")
    private String customerEmail;

    @Schema(description = "시작일", example = "2026-04-01")
    private LocalDate startDate;
    @Schema(description = "종료일", example = "2026-04-03")
    private LocalDate endDate;

    @Schema(description = "캘린더 색상 코드", example = "#FF5733")
    private String colorCode;
    @Schema(description = "예약 상태", example = "확정")
    private String status;
    @Schema(description = "업체 주소")
    private String companyAddress;
    @Schema(description = "현장 담당자")
    private String siteManager;
    @Schema(description = "현장 담당자 연락처")
    private String siteManagerPhone;
    @Schema(description = "특이사항", example = "채식 메뉴 요청")
    private String memo;

    @Schema(description = "객실 예약 목록")
    private List<RoomReservationResponse> rooms;
    @Schema(description = "강의실 예약 목록")
    private List<ClassroomReservationResponse> classrooms;
    @Schema(description = "식사 예약 목록")
    private List<MealReservationResponse> meals;

    public static ReservationResponse of(Reservation reservation,
                                         List<RoomReservationResponse> rooms,
                                         List<ClassroomReservationResponse> classrooms,
                                         List<MealReservationResponse> meals) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .reservationCode(reservation.getReservationCode())
                .organization(reservation.getOrganization())
                .purpose(reservation.getPurpose())
                .people(reservation.getPeople())
                .customer(reservation.getCustomer())
                .customerPhone(reservation.getCustomerPhone())
                .customerPhone2(reservation.getCustomerPhone2())
                .customerEmail(reservation.getCustomerEmail())
                .startDate(reservation.getStartDate())
                .endDate(reservation.getEndDate())
                .colorCode(reservation.getColorCode())
                .status(reservation.getStatus())
                .companyAddress(reservation.getCompanyAddress())
                .siteManager(reservation.getSiteManager())
                .siteManagerPhone(reservation.getSiteManagerPhone())
                .memo(reservation.getMemo())
                .rooms(rooms)
                .classrooms(classrooms)
                .meals(meals)
                .build();
    }
}
