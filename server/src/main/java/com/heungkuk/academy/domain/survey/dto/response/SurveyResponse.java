package com.heungkuk.academy.domain.survey.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.heungkuk.academy.domain.reservation.entity.Reservation;
import com.heungkuk.academy.domain.survey.entity.Survey;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SurveyResponse {

    private Long id;
    private String answer;
    private String reservationId;
    private String organization;
    private String customer;
    private LocalDate startDate;
    private LocalDate endDate;
    private String colorCode;
    private LocalDateTime createdAt;


    public static SurveyResponse from(Survey survey, Reservation reservation) {
        return SurveyResponse.builder().id(survey.getId()).answer(survey.getAnswer())
                .reservationId(survey.getSurveyToken().getReservationId())
                .organization(reservation != null ? reservation.getOrganization() : null)
                .customer(reservation != null ? reservation.getCustomer() : null)
                .startDate(reservation != null ? reservation.getStartDate() : null)
                .endDate(reservation != null ? reservation.getEndDate() : null)
                .colorCode(reservation != null ? reservation.getColorCode() : null)
                .createdAt(survey.getCreatedAt()).build();
    }

    public static SurveyResponse from(Survey survey) {
        return from(survey, null);
    }
}
