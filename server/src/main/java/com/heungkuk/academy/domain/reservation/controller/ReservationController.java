package com.heungkuk.academy.domain.reservation.controller;

import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.heungkuk.academy.domain.reservation.dto.request.ReservationRequest;
import com.heungkuk.academy.domain.reservation.dto.response.ReservationResponse;
import com.heungkuk.academy.domain.reservation.service.ReservationService;
import com.heungkuk.academy.global.response.CommonResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Tag(name = "예약 관리", description = "예약 등록 / 조회 / 수정 / 삭제 API (관리자 전용)")
@SecurityRequirement(name = "Bearer")
@RestController
@RequestMapping("/v1/admin/reservations")
@Slf4j
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "예약 등록", description = "새로운 예약을 등록합니다. 객실, 강의실, 식사 정보를 함께 등록할 수 있습니다.")
    @ApiResponses({@ApiResponse(responseCode = "201", description = "예약 등록 성공"),
            @ApiResponse(responseCode = "400", description = "입력값 오류"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "409", description = "강의실 시간 중복")})
    @PostMapping
    public ResponseEntity<CommonResponse<ReservationResponse>> createReservation(
            @RequestBody @Valid ReservationRequest request) {
        return ResponseEntity.status(201)
                .body(CommonResponse.success(reservationService.createReservation(request)));
    }

    @Operation(summary = "예약 전체 조회", description = "전체 예약 목록을 반환합니다.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")})
    @GetMapping
    public ResponseEntity<CommonResponse<List<ReservationResponse>>> getReservations() {
        return ResponseEntity.status(200)
                .body(CommonResponse.success(reservationService.getReservations()));
    }

    @Operation(summary = "예약 단건 조회", description = "예약 ID로 단건 예약 정보를 반환합니다.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "예약을 찾을 수 없음")})
    @GetMapping("/{id}")
    public ResponseEntity<CommonResponse<ReservationResponse>> getReservation(
            @Parameter(description = "예약 ID", example = "1") @PathVariable Long id) {
        return ResponseEntity.status(200)
                .body(CommonResponse.success(reservationService.getReservation(id)));
    }

    @Operation(summary = "예약 수정", description = "예약 정보를 전체 수정합니다. 기존 객실/강의실/식사 정보는 삭제 후 재등록됩니다.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "400", description = "입력값 오류"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "예약을 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "강의실 시간 중복")})
    @PutMapping("/{id}")
    public ResponseEntity<CommonResponse<ReservationResponse>> updateReservation(
            @Parameter(description = "예약 ID", example = "1") @PathVariable Long id,
            @RequestBody @Valid ReservationRequest request) {
        return ResponseEntity.status(200)
                .body(CommonResponse.success(reservationService.updateReservation(id, request)));
    }

    @Operation(summary = "예약 취소", description = "예약 상태를 '취소'로 변경합니다. (소프트 삭제)")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "취소 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "예약을 찾을 수 없음")})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(
            @Parameter(description = "예약 ID", example = "1") @PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.status(204).build();
    }

    @Operation(summary = "예약 완전 삭제", description = "예약과 하위 데이터(강의실/객실/식사)를 DB에서 영구 삭제합니다.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "예약을 찾을 수 없음")})
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteReservation(
            @Parameter(description = "예약 ID", example = "1") @PathVariable Long id) {
        reservationService.hardDeleteReservation(id);
        return ResponseEntity.status(204).build();
    }

    @Operation(summary = "강의실 가용 여부 확인", description = "특정 날짜/시간대에 강의실이 사용 가능한지 확인합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "확인 성공 (true: 사용 가능, false: 사용 불가)"),
            @ApiResponse(responseCode = "401", description = "인증 실패")})
    @GetMapping("/check-classroom")
    public ResponseEntity<CommonResponse<Boolean>> checkClassroom(
            @Parameter(description = "강의실명", example = "105") @RequestParam String classroom,
            @Parameter(description = "날짜 (yyyy-MM-dd)",
                    example = "2026-04-01") @RequestParam @DateTimeFormat(
                            iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.status(200)
                .body(CommonResponse.success(reservationService.checkClassroom(classroom, date)));
    }
}
