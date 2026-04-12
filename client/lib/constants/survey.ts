import { SurveyAnswers } from '@/types/survey';

export const SATISFACTION_LABELS: Record<number, { text: string; bad: boolean }> = {
  1: { text: '매우 만족', bad: false },
  2: { text: '만족', bad: false },
  3: { text: '보통', bad: false },
  4: { text: '불만족', bad: true },
  5: { text: '매우 불만족', bad: true },
};

export const SATISFACTION_ITEMS: {
  key: keyof SurveyAnswers;
  label: string;
  commentKey: keyof SurveyAnswers;
}[] = [
  { key: 'staffService', label: '직원 서비스', commentKey: 'staffServiceComment' },
  { key: 'cleanliness', label: '청결 상태', commentKey: 'cleanlinessComment' },
  { key: 'facilities', label: '시설', commentKey: 'facilitiesComment' },
  { key: 'cafeteria', label: '식당', commentKey: 'cafeteriaComment' },
  { key: 'pricing', label: '이용 비용', commentKey: 'pricingComment' },
];

export const REVISIT_LABELS: Record<string, string> = {
  very_likely: '매우 그렇다',
  likely: '그렇다',
  possible: '불만사항이 개선될 경우 검토 가능',
  unlikely: '재방문 의향 없다',
};
