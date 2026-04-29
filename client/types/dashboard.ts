export interface DashboardKpi {
  monthlyReservations: number;
  monthlyChange: number;
  todayCheckIn: number;
  todayPeople: number;
  surveyScore: number;
  surveyCount: number;
}

export interface TodayClassroomItem {
  reservationId: number;
  classroom: string;
  organization: string;
  purpose: string;
  people: number;
}

export interface MonthlyItem {
  month: number;
  count: number;
}

export interface SatisfactionData {
  staffService: number;
  cleanliness: number;
  facilities: number;
  cafeteria: number;
  pricing: number;
  totalCount: number;
}

export interface RecentSurveyItem {
  id: number;
  organization: string | null;
  customer: string | null;
  startDate: string | null;
  endDate: string | null;
  colorCode: string | null;
  staffService: number;
  cleanliness: number;
  facilities: number;
  cafeteria: number;
  pricing: number;
  revisit: string | null;
  createdAt: string;
}

export interface DashboardData {
  kpi: DashboardKpi;
  todayClassrooms: TodayClassroomItem[];
  monthlyData: MonthlyItem[];
  satisfaction: SatisfactionData;
  recentSurveys: RecentSurveyItem[];
}
