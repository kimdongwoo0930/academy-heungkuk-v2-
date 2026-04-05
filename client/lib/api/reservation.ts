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
  companyZipCode?: string;
  companyAddress?: string;
  businessNumber?: string;
  ceoName?: string;
  siteManager?: string;
  siteManagerPhone?: string;
  siteManagerPhone2?: string;
  siteManagerEmail?: string;
  billingManager?: string;
  billingManagerPhone?: string;
  billingManagerEmail?: string;
  paymentMethod?: string;
  memo?: string;
  classrooms: { classroomName: string; reservedDate: string }[];
  rooms: { roomNumber: string; reservedDate: string }[];
  meals: { reservedDate: string; breakfast: number; lunch: number; dinner: number; specialBreakfast?: boolean; specialLunch?: boolean; specialDinner?: boolean }[];
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
    companyZipCode: data.companyZipCode,
    companyAddress: data.companyAddress,
    businessNumber: data.businessNumber,
    ceoName: data.ceoName,
    siteManager: data.siteManager,
    siteManagerPhone: data.siteManagerPhone,
    siteManagerPhone2: data.siteManagerPhone2,
    siteManagerEmail: data.siteManagerEmail,
    billingManager: data.billingManager,
    billingManagerPhone: data.billingManagerPhone,
    billingManagerEmail: data.billingManagerEmail,
    paymentMethod: data.paymentMethod,
    memo: data.memo,
    classrooms: (data.classrooms ?? []).map((c) => ({
      classroomName: c.classroomName,
      reservedDate: c.reservedDate,
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
      specialBreakfast: m.specialBreakfast ?? false,
      specialLunch: m.specialLunch ?? false,
      specialDinner: m.specialDinner ?? false,
    })),
  };
}

export async function getReservations(): Promise<Reservation[]> {
  const res = await instance.get('/v1/admin/reservations');
  return res.data.data;
}

export async function getReservationsByYear(year: number): Promise<Reservation[]> {
  const res = await instance.get('/v1/admin/reservations', { params: { year } });
  return res.data.data;
}

export async function getReservationsByRange(from: string, to: string): Promise<Reservation[]> {
  const res = await instance.get('/v1/admin/reservations/range', { params: { from, to } });
  return res.data.data;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function searchReservations(params: {
  keyword?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PageResult<Reservation>> {
  const res = await instance.get('/v1/admin/reservations/search', { params });
  return res.data.data;
}

export async function getReservationById(id: number): Promise<Reservation> {
  const res = await instance.get(`/v1/admin/reservations/${id}`);
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

export async function hardDeleteReservation(id: number): Promise<void> {
  await instance.delete(`/v1/admin/reservations/${id}/hard`);
}

/**
 * 전체 예약 데이터를 xlsx 파일로 다운로드
 *
 * responseType: 'blob' — 서버에서 byte[]로 내려주는 파일을
 * axios가 Blob(브라우저 바이너리 객체)으로 받아주는 설정
 *
 * URL.createObjectURL(blob) — Blob을 가리키는 임시 URL 생성
 * → <a> 태그에 연결해서 클릭하면 파일 저장 다이얼로그가 뜸
 */
export interface ImportResult {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

/**
 * xlsx 파일을 서버로 업로드하여 예약 데이터를 일괄 등록/수정
 * FormData에 파일을 담아 multipart/form-data 로 전송
 */
export async function importReservations(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await instance.post<{ data: ImportResult }>('/v1/admin/reservations/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function downloadTrade(id: number, org?: string): Promise<void> {
  const res = await instance.get(`/v1/admin/reservations/${id}/trade`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = org ? `거래명세서_${org}.xlsx` : `거래명세서_${id}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadEstimate(id: number, org?: string): Promise<void> {
  const res = await instance.get(`/v1/admin/reservations/${id}/estimate`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = org ? `견적서_${org}.xlsx` : `견적서_${id}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadConfirmation(id: number, org?: string): Promise<void> {
  const res = await instance.get(`/v1/admin/reservations/${id}/confirmation`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = org ? `확인서_${org}.xlsx` : `확인서_${id}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportReservations(): Promise<void> {
  const res = await instance.get('/v1/admin/reservations/export', {
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `reservations_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url); // 메모리 해제
}
