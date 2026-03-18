package com.heungkuk.academy.domain.reservation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "예약 등록/수정 요청")
@Getter
@NoArgsConstructor
public class ReservationRequest {

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
    @Schema(description = "담당자 연락처2 (선택)", example = "02-1234-5678")
    private String customerPhone2;
    @Schema(description = "담당자 이메일 (선택)", example = "hong@samsung.com")
    private String customerEmail;

    @Schema(description = "시작일", example = "2026-04-01")
    private LocalDate startDate;
    @Schema(description = "종료일", example = "2026-04-03")
    private LocalDate endDate;

    @Schema(description = "캘린더 색상 코드", example = "#FF5733")
    private String colorCode;
    @Schema(description = "예약 상태", example = "확정", allowableValues = {"확정", "대기", "취소"})
    private String status;
    @Schema(description = "특이사항 (선택)", example = "채식 메뉴 요청")
    private String memo;

    @Schema(description = "객실 요청 목록")
    private List<RoomRequest> rooms;
    @Schema(description = "강의실 요청 목록")
    private List<ClassroomRequest> classrooms;
    @Schema(description = "식사 요청 목록")
    private List<MealRequest> meals;
}
