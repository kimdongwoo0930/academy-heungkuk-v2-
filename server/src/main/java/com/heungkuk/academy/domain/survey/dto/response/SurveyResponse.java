package com.heungkuk.academy.domain.survey.dto.response;

import com.heungkuk.academy.domain.survey.entity.Survey;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SurveyResponse {

    private Long id;
    private String answer;
    private LocalDateTime createdAt;

    public static SurveyResponse from(Survey survey) {
        return SurveyResponse.builder()
                .id(survey.getId())
                .answer(survey.getAnswer())
                .createdAt(survey.getCreatedAt())
                .build();
    }
}
