package com.heungkuk.academy.domain.dashboard.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardResponse {

    private KpiSection kpi;
    private List<TodayClassroomItem> todayClassrooms;
    private List<MonthlyItem> monthlyData;
    private SatisfactionSection satisfaction;
    private List<RecentSurveyItem> recentSurveys;

    @Getter
    @Builder
    public static class KpiSection {
        private long monthlyReservations;
        private long monthlyChange;
        private long todayCheckIn;
        private long todayPeople;
        private double surveyScore;
        private long surveyCount;
    }

    @Getter
    @Builder
    public static class TodayClassroomItem {
        private String classroom;
        private String organization;
        private String purpose;
        private Integer people;
    }

    @Getter
    @Builder
    public static class MonthlyItem {
        private int month;
        private long count;
    }

    @Getter
    @Builder
    public static class SatisfactionSection {
        private double staffService;
        private double cleanliness;
        private double facilities;
        private double cafeteria;
        private double pricing;
        private long totalCount;
    }

    @Getter
    @Builder
    public static class RecentSurveyItem {
        private Long id;
        private String organization;
        private String customer;
        private LocalDate startDate;
        private LocalDate endDate;
        private String colorCode;
        private int staffService;
        private int cleanliness;
        private int facilities;
        private int cafeteria;
        private int pricing;
        private String revisit;
        private LocalDateTime createdAt;
    }
}
