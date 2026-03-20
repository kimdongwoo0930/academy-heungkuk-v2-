/**
 * 더미 데이터 in-memory store
 * API 연결 전 프론트 개발용 — lib/api/reservation.ts 함수와 시그니처 동일
 */
import { Reservation } from '@/types/reservation';
import { dummyReservations } from './reservations';

interface ReservationRequestBody {
  organization: string;
  purpose: string;
  people: number;
  customer: string;
  customerPhone: string;
  customerPhone2?: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  colorCode: string;
  status: string;
  memo?: string;
  classrooms: { classroomName: string; reservedDate: string; startTime?: string; endTime?: string }[];
  rooms: { roomNumber: string; reservedDate: string }[];
  meals: { reservedDate: string; breakfast: number; lunch: number; dinner: number }[];
}

// 모듈 레벨 변수 — 세션 중 유지됨
let _reservations: Reservation[] = [...dummyReservations];
let _nextId = dummyReservations.length + 1;

function genCode(id: number): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `HK-${d}-${String(id).padStart(3, '0')}`;
}

export function toRequestBody(data: Omit<Reservation, 'id' | 'reservationCode'>): ReservationRequestBody {
  return {
    organization: data.organization,
    purpose: data.purpose,
    people: data.people,
    customer: data.customer,
    customerPhone: data.customerPhone,
    customerPhone2: data.customerPhone2,
    customerEmail: data.customerEmail,
    startDate: data.startDate,
    endDate: data.endDate,
    colorCode: data.colorCode,
    status: data.status,
    memo: data.memo,
    classrooms: (data.classrooms ?? []).map((c) => ({
      classroomName: c.classroomName,
      reservedDate: c.reservedDate,
      startTime: c.startTime,
      endTime: c.endTime,
    })),
    rooms: (data.rooms ?? []).map((r) => ({
      roomNumber: r.roomNumber,
      reservedDate: r.reservedDate,
    })),
    meals: (data.meals ?? []).map((m) => ({
      reservedDate: m.reservedDate,
      breakfast: m.breakfast,
      lunch: m.lunch,
      dinner: m.dinner,
    })),
  };
}

export async function getReservations(): Promise<Reservation[]> {
  return [..._reservations];
}

export async function createReservation(body: ReservationRequestBody): Promise<Reservation> {
  const id = _nextId++;
  const newRes: Reservation = {
    id,
    reservationCode: genCode(id),
    organization: body.organization,
    purpose: body.purpose,
    people: body.people,
    customer: body.customer,
    customerPhone: body.customerPhone,
    customerPhone2: body.customerPhone2,
    customerEmail: body.customerEmail,
    startDate: body.startDate,
    endDate: body.endDate,
    colorCode: body.colorCode,
    status: body.status,
    memo: body.memo,
    classrooms: body.classrooms.map((c) => ({ ...c })),
    rooms: body.rooms.map((r) => ({ roomNumber: r.roomNumber, roomType: '2인실', reservedDate: r.reservedDate })),
    meals: body.meals.map((m) => ({ ...m })),
  };
  _reservations = [newRes, ..._reservations];
  return newRes;
}

export async function updateReservation(id: number, body: ReservationRequestBody): Promise<Reservation> {
  const existing = _reservations.find((r) => r.id === id);
  if (!existing) throw new Error('예약을 찾을 수 없습니다.');
  const updated: Reservation = {
    ...existing,
    organization: body.organization,
    purpose: body.purpose,
    people: body.people,
    customer: body.customer,
    customerPhone: body.customerPhone,
    customerPhone2: body.customerPhone2,
    customerEmail: body.customerEmail,
    startDate: body.startDate,
    endDate: body.endDate,
    colorCode: body.colorCode,
    status: body.status,
    memo: body.memo,
    classrooms: body.classrooms.map((c) => ({ ...c })),
    rooms: body.rooms.map((r) => ({
      roomNumber: r.roomNumber,
      roomType: existing.rooms?.find((er) => er.roomNumber === r.roomNumber)?.roomType ?? '2인실',
      reservedDate: r.reservedDate,
    })),
    meals: body.meals.map((m) => ({ ...m })),
  };
  _reservations = _reservations.map((r) => (r.id === id ? updated : r));
  return updated;
}

export async function deleteReservation(id: number): Promise<void> {
  _reservations = _reservations.filter((r) => r.id !== id);
}
