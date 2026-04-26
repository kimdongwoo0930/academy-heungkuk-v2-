export type ScoreValue = '매우 만족' | '만족' | '보통' | '불만족';
export type RevisitValue = '매우 그렇다' | '그렇다' | '보통' | '그렇지 않다';

export interface SurveyTag {
  label: string;
  variant: 'loc' | 'goal';
}

export interface SurveyCardData {
  id: number;
  org: string;
  code: string;
  manager: string;
  dateRange: string;
  responseTime: string;
  dotColor: string;
  previewColors: string[];
  hasRevisit: boolean;
  responseCount: number;
  tags: SurveyTag[];
  scores: {
    service: ScoreValue;
    clean: ScoreValue;
    facility: ScoreValue;
    restaurant: ScoreValue;
    price: ScoreValue;
  };
  revisit: RevisitValue;
  opinion: string;
  defaultExpanded?: boolean;
}

export const surveyCards: SurveyCardData[] = [
  {
    id: 1,
    org: '수원여자대학교',
    code: 'HK-20260411-001',
    manager: '임경욱 교수',
    dateRange: '2026-04-11 ~ 2026-04-12',
    responseTime: '2026. 4. 18. 오후 2:13:51',
    dotColor: '#0eab6e',
    previewColors: ['#0eab6e', '#0eab6e', '#d97706', '#0eab6e', '#0eab6e'],
    hasRevisit: true,
    responseCount: 1,
    tags: [
      { label: '📍 수원', variant: 'loc' },
      { label: '🎯 MT', variant: 'goal' },
    ],
    scores: { service: '매우 만족', clean: '매우 만족', facility: '보통', restaurant: '매우 만족', price: '매우 만족' },
    revisit: '매우 그렇다',
    opinion: '전반적으로 좋았습니다.',
    defaultExpanded: true,
  },
  {
    id: 2,
    org: '용인교육지원청',
    code: 'HK-20260407-001',
    manager: '정미영 장학사',
    dateRange: '2026-04-07 ~ 2026-04-07',
    responseTime: '2026. 4. 15. 오후 6:12:28',
    dotColor: '#2563eb',
    previewColors: ['#0eab6e', '#2563eb', '#2563eb', '#2563eb', '#2563eb'],
    hasRevisit: true,
    responseCount: 1,
    tags: [
      { label: '📍 용인', variant: 'loc' },
      { label: '🎯 리더십 등 직원 역량강화 교육', variant: 'goal' },
    ],
    scores: { service: '매우 만족', clean: '만족', facility: '만족', restaurant: '만족', price: '만족' },
    revisit: '매우 그렇다',
    opinion: '실물 태극기도 있으면 좋겠어요~^^',
    defaultExpanded: true,
  },
  {
    id: 3,
    org: '용인교육지원청',
    code: 'HK-20260402-001',
    manager: '서문소연 주무관',
    dateRange: '2026-04-02 ~ 2026-04-02',
    responseTime: '2026. 4. 14. 오전 8:56:52',
    dotColor: '#d97706',
    previewColors: ['#0eab6e', '#0eab6e', '#d97706', '#2563eb', '#2563eb'],
    hasRevisit: true,
    responseCount: 1,
    tags: [
      { label: '📍 용인', variant: 'loc' },
      { label: '🎯 직무연수', variant: 'goal' },
    ],
    scores: { service: '매우 만족', clean: '매우 만족', facility: '보통', restaurant: '만족', price: '만족' },
    revisit: '그렇다',
    opinion: '전반적으로 만족스러웠습니다.',
    defaultExpanded: false,
  },
  {
    id: 4,
    org: '흥국생명',
    code: 'HK-20260709-001',
    manager: '강석태 과장',
    dateRange: '2026-07-09 ~ 2026-07-10',
    responseTime: '2026. 7. 12. 오전 11:22:05',
    dotColor: '#e8306a',
    previewColors: ['#0eab6e', '#0eab6e', '#2563eb', '#0eab6e', '#0eab6e'],
    hasRevisit: true,
    responseCount: 1,
    tags: [
      { label: '📍 서울', variant: 'loc' },
      { label: '🎯 임직원 교육', variant: 'goal' },
    ],
    scores: { service: '매우 만족', clean: '매우 만족', facility: '만족', restaurant: '매우 만족', price: '매우 만족' },
    revisit: '매우 그렇다',
    opinion: '다음에도 꼭 이용하겠습니다.',
    defaultExpanded: false,
  },
];
