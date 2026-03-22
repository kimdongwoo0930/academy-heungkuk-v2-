package com.heungkuk.academy.domain.reservation.dto.request;

import java.time.LocalDate;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "식사 예약 요청")
@Getter
@NoArgsConstructor
public class MealRequest {

    @Schema(description = "식사 날짜", example = "2026-04-01")
    private LocalDate reservedDate;
    @Schema(description = "조식 인원", example = "30")
    private Integer breakfast;
    @Schema(description = "중식 인원", example = "30")
    private Integer lunch;
    @Schema(description = "석식 인원", example = "25")
    private Integer dinner;
    @Schema(description = "특식) 조식 여부", example = "true")
    private boolean specialBreakfast;
    @Schema(description = "특식) 중식 여부", example = "false")
    private boolean specialLunch;
    @Schema(description = "특식) 석식 여부", example = "false")
    private boolean specialDinner;
}
