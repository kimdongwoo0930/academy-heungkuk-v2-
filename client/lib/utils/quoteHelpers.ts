import { RoomReservation } from '@/types/reservation';

export function taxOf(n: number): number {
  return Math.floor(n * 0.1);
}

export function totalOf(n: number): number {
  return n + taxOf(n);
}

export function fmt(n: number): string {
  return n.toLocaleString('ko-KR');
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dow = '일월화수목금토'[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dow})`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}일(${'일월화수목금토'[d.getDay()]})`;
}

export function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  while (d <= e) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export interface RoomStat {
  nights: number | null;
  rooms: number;
  total: number;
}

export function getRoomStat(entries: RoomReservation[]): RoomStat | null {
  if (!entries.length) return null;
  const uniqueRooms = new Set(entries.map((e) => e.roomNumber)).size;
  const total = entries.length;
  const nightsEach = total / uniqueRooms;
  return {
    nights: Number.isInteger(nightsEach) ? nightsEach : null,
    rooms: uniqueRooms,
    total,
  };
}
