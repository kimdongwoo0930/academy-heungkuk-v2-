package com.heungkuk.academy.domain.survey.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SurveyRequest {

    private String location;
    private String locationEtc;

    private String industry;
    private String industryEtc;

    private String purpose;
    private String purposeEtc;

    private String visitRoute;
    private String visitRouteEtc;

    private Integer staffService;
    private String staffServiceComment;

    private Integer cleanliness;
    private String cleanlinessComment;

    private Integer facilities;
    private String facilitiesComment;

    private Integer cafeteria;
    private String cafeteriaComment;

    private Integer pricing;
    private String pricingComment;

    private String revisit;
    private String revisitComment;

    private String comment;
}
