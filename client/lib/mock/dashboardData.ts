export type ScoreLevel = '매우만족' | '만족' | '보통' | '불만족';
export type RevisitLevel = '매우 그렇다' | '그렇다' | '보통' | '그렇지 않다';

export const kpiData = {
  monthlyReservations: 24,
  monthlyChange: 6,
  todayCheckIn: 3,
  todayPeople: 58,
  surveyScore: 4.6,
  surveyCount: 24,
};

export interface Schedule {
  id: number;
  org: string;
  room: string;
  people: number;
  time: string;
  dotColor: string;
  tagLabel: string;
  tagVariant: 'pink' | 'blue' | 'green';
}

export const todaySchedules: Schedule[] = [
  {
    id: 1,
    org: '흥국생명',
    room: '대강의실 105호',
    people: 120,
    time: '종일',
    dotColor: '#e8306a',
    tagLabel: '종일',
    tagVariant: 'pink',
  },
  {
    id: 2,
    org: '성광중심교회',
    room: '소강의실 102호',
    people: 20,
    time: '09:00 ~ 13:00',
    dotColor: '#2563eb',
    tagLabel: '오전',
    tagVariant: 'blue',
  },
  {
    id: 3,
    org: '양해이_이선희',
    room: '소강의실 103호',
    people: 30,
    time: '14:00 ~ 18:00',
    dotColor: '#0eab6e',
    tagLabel: '오후',
    tagVariant: 'green',
  },
];

export const todayAccommodation = { checkIn: 17, checkOut: 3, remaining: 22 };
export const todayMeal = { breakfast: 22, lunch: 58, dinner: 17 };

export interface MonthData {
  month: string;
  val: number;
  current?: boolean;
}

export const monthlyData: MonthData[] = [
  { month: '1월', val: 8 },
  { month: '2월', val: 12 },
  { month: '3월', val: 18 },
  { month: '4월', val: 24, current: true },
  { month: '5월', val: 0 },
  { month: '6월', val: 0 },
  { month: '7월', val: 0 },
  { month: '8월', val: 0 },
  { month: '9월', val: 0 },
  { month: '10월', val: 0 },
  { month: '11월', val: 0 },
  { month: '12월', val: 0 },
];

export interface Room {
  id: number;
  name: string;
  capacity: number;
  occupied: boolean;
  org?: string;
}

export const rooms: Room[] = [
  { id: 1,  name: '소강의실 101호', capacity: 30,  occupied: false },
  { id: 2,  name: '소강의실 102호', capacity: 20,  occupied: true, org: '성광중심교회' },
  { id: 3,  name: '소강의실 103호', capacity: 30,  occupied: true, org: '양해이_이선희' },
  { id: 4,  name: '대강의실 105호', capacity: 120, occupied: true, org: '흥국생명' },
  { id: 5,  name: '분임실 106호',   capacity: 12,  occupied: false },
  { id: 6,  name: '분임실 107호',   capacity: 12,  occupied: false },
  { id: 7,  name: '중강의실 201호', capacity: 70,  occupied: false },
  { id: 8,  name: '소강의실 202호', capacity: 30,  occupied: false },
  { id: 9,  name: '중강의실 203호', capacity: 50,  occupied: false },
  { id: 10, name: '중강의실 204호', capacity: 50,  occupied: false },
  { id: 11, name: '분임실 205호',   capacity: 12,  occupied: false },
  { id: 12, name: '분임실 206호',   capacity: 12,  occupied: false },
  { id: 13, name: '다목적실 A',     capacity: 80,  occupied: false },
  { id: 14, name: '다목적실 B',     capacity: 40,  occupied: false },
];

export interface SatItem {
  label: string;
  score: number;
  count: number;
  width: number;
  colorFrom: string;
  colorTo: string;
}

export const satisfactionItems: SatItem[] = [
  { label: '직원 서비스', score: 4.8, count: 24, width: 96, colorFrom: '#0eab6e', colorTo: '#2dd4bf' },
  { label: '청결 상태',   score: 4.6, count: 24, width: 92, colorFrom: '#0eab6e', colorTo: '#2dd4bf' },
  { label: '식당',        score: 4.5, count: 24, width: 90, colorFrom: '#2563eb', colorTo: '#7c3aed' },
  { label: '이용 비용',   score: 4.3, count: 24, width: 86, colorFrom: '#2563eb', colorTo: '#7c3aed' },
  { label: '시설',        score: 4.2, count: 24, width: 84, colorFrom: '#d97706', colorTo: '#f97316' },
];

export const miniStats = { revisit: 87, responseRate: 96 };

export interface SurveyRow {
  id: number;
  org: string;
  manager: string;
  usagePeriod: string;
  responseDate: string;
  service: ScoreLevel;
  clean: ScoreLevel;
  facility: ScoreLevel;
  restaurant: ScoreLevel;
  price: ScoreLevel;
  revisit: RevisitLevel;
}

export const recentSurveys: SurveyRow[] = [
  {
    id: 1,
    org: '수원여자대학교',
    manager: '임경욱 교수',
    usagePeriod: '04-11 ~ 04-12',
    responseDate: '04-18',
    service: '매우만족', clean: '매우만족', facility: '보통', restaurant: '매우만족', price: '매우만족',
    revisit: '매우 그렇다',
  },
  {
    id: 2,
    org: '용인교육지원청',
    manager: '정미영 장학사',
    usagePeriod: '04-07',
    responseDate: '04-15',
    service: '매우만족', clean: '만족', facility: '만족', restaurant: '만족', price: '만족',
    revisit: '매우 그렇다',
  },
  {
    id: 3,
    org: '용인교육지원청',
    manager: '서문소연 주무관',
    usagePeriod: '04-02',
    responseDate: '04-14',
    service: '매우만족', clean: '매우만족', facility: '보통', restaurant: '만족', price: '만족',
    revisit: '그렇다',
  },
  {
    id: 4,
    org: '현대모비스',
    manager: '이진수 팀장',
    usagePeriod: '03-31 ~ 04-01',
    responseDate: '04-02',
    service: '매우만족', clean: '매우만족', facility: '보통', restaurant: '매우만족', price: '만족',
    revisit: '그렇다',
  },
  {
    id: 5,
    org: '흥국생명',
    manager: '강석태 과장',
    usagePeriod: '03-20 ~ 03-21',
    responseDate: '03-25',
    service: '매우만족', clean: '매우만족', facility: '만족', restaurant: '매우만족', price: '매우만족',
    revisit: '매우 그렇다',
  },
];
