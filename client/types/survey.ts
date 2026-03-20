export interface SurveyTokenResponse {
  id: number;
  token: string;
  reservationId: string;
}

export interface SurveyResult {
  id: number;
  answer: string; // JSON string
  createdAt: string;
}

// 설문 답변 JSON 구조
export interface SurveyAnswers {
  facility: number;   // 시설 만족도 1-5
  meal: number;       // 식사 만족도 1-5
  service: number;    // 서비스 만족도 1-5
  classroom: number;  // 강의실 만족도 1-5
  overall: number;    // 전체 만족도 1-5
  comment: string;    // 자유 의견
}
