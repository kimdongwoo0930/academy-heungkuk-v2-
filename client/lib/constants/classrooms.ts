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

export const CLASSROOM_PRICE: Record<ClassroomCategory, ClassroomPriceInfo> = {
  '대형(120인)': { label: '대형(120인)', pricePerDay: 1_200_000 },
  '중형(70인)':  { label: '중형(70인)',  pricePerDay:   560_000 },
  '중형(50인)':  { label: '중형(50인)',  pricePerDay:   400_000 },
  '소형(30인)':  { label: '소형(30인)',  pricePerDay:   240_000 },
  '소형(20인)':  { label: '소형(20인)',  pricePerDay:   160_000 },
  '분임실(12인)': { label: '분임실(12인)', pricePerDay:   96_000 },
  '다목적실':    { label: '다목적실',    pricePerDay:   250_000 },
};
