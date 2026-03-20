package com.heungkuk.academy.domain.reservation.dto.request;

import java.time.LocalDate;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "강의실 예약 요청")
@Getter
@NoArgsConstructor
public class ClassroomRequest {

    @Schema(description = "강의실명", example = "105")
    private String classroomName;
    @Schema(description = "사용 날짜", example = "2026-04-01")
    private LocalDate reservedDate;
}
