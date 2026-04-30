export interface ClassroomPriceInfo {
  label: string;
  pricePerDay: number;
}

// 견적서에 항상 고정 표시되는 7개 강의실 규격 (순서 유지)
export const CLASSROOM_CATEGORIES = [
  '대형(120인)',
  '중형(70인)',
  '중형(50인)',
  '소형(30인)',
  '소형(20인)',
  '분임실(12인)',
  '다목적실',
] as const;

export type ClassroomCategory = typeof CLASSROOM_CATEGORIES[number];

// 호실 번호 → 카테고리 매핑 (DB에 저장된 classroomName 기준)
export const CLASSROOM_ROOM_TO_CATEGORY: Record<string, ClassroomCategory> = {
  '105': '대형(120인)',
  '201': '중형(70인)',
  '203': '중형(50인)',
  '204': '중형(50인)',
  '101': '소형(30인)',
  '102': '소형(20인)',
  '103': '소형(30인)',
  '202': '소형(30인)',
  '106': '분임실(12인)',
  '107': '분임실(12인)',
  '205': '분임실(12인)',
  '206': '분임실(12인)',
  'A': '다목적실',
  'B': '다목적실',
};

export const CLASSROOM_LIST = [
  { code: '101', name: '소강의실 101호', capacity: 30 },
  { code: '102', name: '소강의실 102호', capacity: 20 },
  { code: '103', name: '소강의실 103호', capacity: 30 },
  { code: '105', name: '대강의실 105호', capacity: 120 },
  { code: '106', name: '분임실 106호',   capacity: 12 },
  { code: '107', name: '분임실 107호',   capacity: 12 },
  { code: '201', name: '중강의실 201호', capacity: 70 },
  { code: '202', name: '소강의실 202호', capacity: 30 },
  { code: '203', name: '중강의실 203호', capacity: 50 },
  { code: '204', name: '중강의실 204호', capacity: 50 },
  { code: '205', name: '분임실 205호',   capacity: 12 },
  { code: '206', name: '분임실 206호',   capacity: 12 },
  { code: 'A',   name: '다목적실 A',     capacity: 80 },
  { code: 'B',   name: '다목적실 B',     capacity: 40 },
] as const;

export const CLASSROOM_PRICE: Record<ClassroomCategory, ClassroomPriceInfo> = {
  '대형(120인)': { label: '대형(120인)', pricePerDay: 1_200_000 },
  '중형(70인)':  { label: '중형(70인)',  pricePerDay:   560_000 },
  '중형(50인)':  { label: '중형(50인)',  pricePerDay:   400_000 },
  '소형(30인)':  { label: '소형(30인)',  pricePerDay:   240_000 },
  '소형(20인)':  { label: '소형(20인)',  pricePerDay:   160_000 },
  '분임실(12인)': { label: '분임실(12인)', pricePerDay:   96_000 },
  '다목적실':    { label: '다목적실',    pricePerDay:   250_000 },
};
