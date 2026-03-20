package com.heungkuk.academy.domain.reservation.dto.response;

import java.time.LocalDate;
import com.heungkuk.academy.domain.reservation.entity.RoomReservation;
import com.heungkuk.academy.domain.reservation.enums.RoomType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "객실 예약 응답")
@Getter
@Builder
public class RoomReservationResponse {

    @Schema(description = "객실 예약 ID", example = "1")
    private Long id;
    @Schema(description = "호실 번호", example = "101")
    private String roomNumber;
    @Schema(description = "호실 타입", example = "4인실")
    private String roomType;
    @Schema(description = "사용 날짜", example = "2026-04-01")
    private LocalDate reservedDate;

    public static RoomReservationResponse of(RoomReservation roomReservation) {
        return RoomReservationResponse.builder().id(roomReservation.getId())
                .roomNumber(roomReservation.getRoomNumber())
                .roomType(RoomType.getDisplayNameByRoomNumber(roomReservation.getRoomNumber()))
                .reservedDate(roomReservation.getReservedDate()).build();
    }
}
