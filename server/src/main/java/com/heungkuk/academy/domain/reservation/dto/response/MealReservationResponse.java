package com.heungkuk.academy.domain.reservation.dto.response;

import com.heungkuk.academy.domain.reservation.entity.MealReservation;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Schema(description = "식사 예약 응답")
@Getter
@Builder
public class MealReservationResponse {

    @Schema(description = "식사 예약 ID", example = "1")
    private Long id;
    @Schema(description = "식사 날짜", example = "2026-04-01")
    private LocalDate reservedDate;
    @Schema(description = "조식 인원", example = "30")
    private Integer breakfast;
    @Schema(description = "중식 인원", example = "30")
    private Integer lunch;
    @Schema(description = "석식 인원", example = "25")
    private Integer dinner;

    public static MealReservationResponse of(MealReservation mealReservation) {
        return MealReservationResponse.builder()
                .id(mealReservation.getId())
                .reservedDate(mealReservation.getMealDate())
                .breakfast(mealReservation.getBreakfast())
                .lunch(mealReservation.getLunch())
                .dinner(mealReservation.getDinner())
                .build();
    }
}
