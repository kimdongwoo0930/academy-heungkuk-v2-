package com.heungkuk.academy.domain.survey.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.heungkuk.academy.domain.survey.dto.request.SurveyRequest;
import com.heungkuk.academy.global.entity.BaseTimeEntity;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "survey")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Survey extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "token_id", nullable = false)
    private SurveyToken surveyToken;

    // ── 기본 정보 ──────────────────────────────────────────────
    @Column(nullable = false, length = 50)
    private String location;

    @Column(name = "location_etc", length = 200)
    private String locationEtc;

    @Column(nullable = false, length = 100)
    private String industry;

    @Column(name = "industry_etc", length = 200)
    private String industryEtc;

    @Column(nullable = false, length = 100)
    private String purpose;

    @Column(name = "purpose_etc", length = 200)
    private String purposeEtc;

    @Column(name = "visit_route", nullable = false, length = 50)
    private String visitRoute;

    @Column(name = "visit_route_etc", length = 200)
    private String visitRouteEtc;

    // ── 만족도 (1=매우만족 ~ 5=매우불만족) ──────────────────────
    @Column(name = "staff_service", nullable = false)
    private Integer staffService;

    @Column(name = "staff_service_comment", columnDefinition = "TEXT")
    private String staffServiceComment;

    @Column(nullable = false)
    private Integer cleanliness;

    @Column(name = "cleanliness_comment", columnDefinition = "TEXT")
    private String cleanlinessComment;

    @Column(nullable = false)
    private Integer facilities;

    @Column(name = "facilities_comment", columnDefinition = "TEXT")
    private String facilitiesComment;

    @Column(nullable = false)
    private Integer cafeteria;

    @Column(name = "cafeteria_comment", columnDefinition = "TEXT")
    private String cafeteriaComment;

    @Column(nullable = false)
    private Integer pricing;

    @Column(name = "pricing_comment", columnDefinition = "TEXT")
    private String pricingComment;

    // ── 종합 의견 ──────────────────────────────────────────────
    @Column(nullable = false, length = 100)
    private String revisit;

    @Column(name = "revisit_comment", columnDefinition = "TEXT")
    private String revisitComment;

    @Column(columnDefinition = "TEXT")
    private String comment;

    public static Survey of(SurveyToken surveyToken, SurveyRequest req) {
        return Survey.builder()
                .surveyToken(surveyToken)
                .location(req.getLocation())
                .locationEtc(req.getLocationEtc())
                .industry(req.getIndustry())
                .industryEtc(req.getIndustryEtc())
                .purpose(req.getPurpose())
                .purposeEtc(req.getPurposeEtc())
                .visitRoute(req.getVisitRoute())
                .visitRouteEtc(req.getVisitRouteEtc())
                .staffService(req.getStaffService())
                .staffServiceComment(req.getStaffServiceComment())
                .cleanliness(req.getCleanliness())
                .cleanlinessComment(req.getCleanlinessComment())
                .facilities(req.getFacilities())
                .facilitiesComment(req.getFacilitiesComment())
                .cafeteria(req.getCafeteria())
                .cafeteriaComment(req.getCafeteriaComment())
                .pricing(req.getPricing())
                .pricingComment(req.getPricingComment())
                .revisit(req.getRevisit())
                .revisitComment(req.getRevisitComment())
                .comment(req.getComment())
                .build();
    }
}
