package com.heungkuk.academy.domain.reservation.dto.response;

import java.time.LocalDate;
import com.heungkuk.academy.domain.reservation.entity.ClassroomReservation;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "강의실 예약 응답")
@Getter
@Builder
public class ClassroomReservationResponse {

    @Schema(description = "강의실 예약 ID", example = "1")
    private Long id;
    @Schema(description = "강의실명", example = "105")
    private String classroomName;
    @Schema(description = "사용 날짜", example = "2026-04-01")
    private LocalDate reservedDate;

    public static ClassroomReservationResponse of(ClassroomReservation classroomReservation) {
        return ClassroomReservationResponse.builder().id(classroomReservation.getId())
                .classroomName(classroomReservation.getClassroom())
                .reservedDate(classroomReservation.getReservedDate()).build();
    }
}
