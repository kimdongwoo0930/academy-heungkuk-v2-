export interface SurveyTokenResponse {
  id: number;
  token: string;
  reservationId: string;
}

export interface SurveyResult {
  id: number;
  answer: string; // JSON string
  reservationId: string;
  createdAt: string;
}

// 설문 답변 JSON 구조 (11개 문항)
export interface SurveyAnswers {
  // Q1. 회사(단체) 위치
  location: string;
  locationEtc: string;

  // Q2. 업태
  industry: string;
  industryEtc: string;

  // Q3. 연수 목적
  purpose: string;
  purposeEtc: string;

  // Q4. 이용 계기
  visitRoute: string;
  visitRouteEtc: string;

  // Q5. 직원 서비스 만족도 (1=매우만족 ~ 5=매우불만족)
  staffService: number;
  staffServiceComment: string;

  // Q6. 청결 상태 만족도
  cleanliness: number;
  cleanlinessComment: string;

  // Q7. 시설 만족도
  facilities: number;
  facilitiesComment: string;

  // Q8. 식당 음식/서비스 만족도
  cafeteria: number;
  cafeteriaComment: string;

  // Q9. 이용 비용 만족도
  pricing: number;
  pricingComment: string;

  // Q10. 재방문 의향
  revisit: string;
  revisitComment: string;

  // Q11. 자유 의견
  comment: string;
}
