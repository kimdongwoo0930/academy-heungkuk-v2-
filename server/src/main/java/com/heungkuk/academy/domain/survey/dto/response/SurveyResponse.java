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
    private String reservationId;
    private String organization;
    private String customer;
    private LocalDate startDate;
    private LocalDate endDate;
    private String colorCode;
    private LocalDateTime createdAt;

    // 기본 정보
    private String location;
    private String locationEtc;
    private String industry;
    private String industryEtc;
    private String purpose;
    private String purposeEtc;
    private String visitRoute;
    private String visitRouteEtc;

    // 만족도
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

    // 종합 의견
    private String revisit;
    private String revisitComment;
    private String comment;

    public static SurveyResponse from(Survey survey, Reservation reservation) {
        return SurveyResponse.builder()
                .id(survey.getId())
                .reservationId(survey.getSurveyToken().getReservationId())
                .organization(reservation != null ? reservation.getOrganization() : null)
                .customer(reservation != null ? reservation.getCustomer() : null)
                .startDate(reservation != null ? reservation.getStartDate() : null)
                .endDate(reservation != null ? reservation.getEndDate() : null)
                .colorCode(reservation != null ? reservation.getColorCode() : null)
                .createdAt(survey.getCreatedAt())
                .location(survey.getLocation())
                .locationEtc(survey.getLocationEtc())
                .industry(survey.getIndustry())
                .industryEtc(survey.getIndustryEtc())
                .purpose(survey.getPurpose())
                .purposeEtc(survey.getPurposeEtc())
                .visitRoute(survey.getVisitRoute())
                .visitRouteEtc(survey.getVisitRouteEtc())
                .staffService(survey.getStaffService())
                .staffServiceComment(survey.getStaffServiceComment())
                .cleanliness(survey.getCleanliness())
                .cleanlinessComment(survey.getCleanlinessComment())
                .facilities(survey.getFacilities())
                .facilitiesComment(survey.getFacilitiesComment())
                .cafeteria(survey.getCafeteria())
                .cafeteriaComment(survey.getCafeteriaComment())
                .pricing(survey.getPricing())
                .pricingComment(survey.getPricingComment())
                .revisit(survey.getRevisit())
                .revisitComment(survey.getRevisitComment())
                .comment(survey.getComment())
                .build();
    }

    public static SurveyResponse from(Survey survey) {
        return from(survey, null);
    }
}
