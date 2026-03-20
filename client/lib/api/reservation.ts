import instance from './instance';
import { Reservation } from '@/types/reservation';

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
  const res = await instance.get('/v1/admin/reservations');
  return res.data.data;
}

export async function createReservation(body: ReservationRequestBody): Promise<Reservation> {
  const res = await instance.post('/v1/admin/reservations', body);
  return res.data.data;
}

export async function updateReservation(id: number, body: ReservationRequestBody): Promise<Reservation> {
  const res = await instance.put(`/v1/admin/reservations/${id}`, body);
  return res.data.data;
}

export async function deleteReservation(id: number): Promise<void> {
  await instance.delete(`/v1/admin/reservations/${id}`);
}
