package com.heungkuk.academy.domain.survey.dto.response;

import com.heungkuk.academy.domain.survey.entity.SurveyToken;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SurveyTokenResponse {

    private Long id;
    private String token;
    private String reservationId;

    public static SurveyTokenResponse from(SurveyToken surveyToken) {
        return SurveyTokenResponse.builder()
                .id(surveyToken.getId())
                .token(surveyToken.getToken())
                .reservationId(surveyToken.getReservationId())
                .build();
    }
}
