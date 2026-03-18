package com.heungkuk.academy.domain.reservation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Schema(description = "객실 예약 요청")
@Getter
@NoArgsConstructor
public class RoomRequest {

    @Schema(description = "호실 번호", example = "101")
    private String roomNumber;
    @Schema(description = "사용 날짜", example = "2026-04-01")
    private LocalDate reservedDate;
}
