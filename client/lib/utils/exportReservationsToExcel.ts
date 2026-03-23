import * as XLSX from 'xlsx';
import { Reservation } from '@/types/reservation';

export function exportReservationsToExcel(reservations: Reservation[]) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: reservation ──────────────────────────────────────
  const reservationRows = reservations.map((r) => ({
    id: r.id,
    reservation_code: r.reservationCode,
    organization: r.organization,
    purpose: r.purpose,
    '인원수': r.people,
    customer: r.customer,
    customer_phone: r.customerPhone,
    customer_phone2: r.customerPhone2 ?? '',
    customer_email: r.customerEmail ?? '',
    start_date: String(r.startDate),
    end_date: String(r.endDate),
    color_code: r.colorCode,
    status: r.status,
    company_address: r.companyAddress ?? '',
    site_manager: r.siteManager ?? '',
    site_manager_phone: r.siteManagerPhone ?? '',
    memo: r.memo ?? '',
  }));

  const wsReservation = XLSX.utils.json_to_sheet(reservationRows);
  wsReservation['!cols'] = [
    { wch: 6 },  { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 6 },
    { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 24 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 6 },
    { wch: 24 }, { wch: 10 }, { wch: 14 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsReservation, 'reservation');

  // ── Sheet 2: room_reservation ─────────────────────────────────
  const roomRows = reservations.flatMap((r) =>
    (r.rooms ?? []).map((rm) => ({
      reservation_id: r.id,
      reservation_code: r.reservationCode,
      room_number: rm.roomNumber,
      reserved_date: String(rm.reservedDate),
    }))
  );

  const wsRoom = XLSX.utils.json_to_sheet(roomRows.length > 0 ? roomRows : [{}]);
  wsRoom['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsRoom, 'room_reservation');

  // ── Sheet 3: classroom_reservation ───────────────────────────
  const classroomRows = reservations.flatMap((r) =>
    (r.classrooms ?? []).map((c) => ({
      reservation_id: r.id,
      reservation_code: r.reservationCode,
      classroom: c.classroomName,
      reserved_date: String(c.reservedDate),
    }))
  );

  const wsClassroom = XLSX.utils.json_to_sheet(classroomRows.length > 0 ? classroomRows : [{}]);
  wsClassroom['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsClassroom, 'classroom_reservation');

  // ── Sheet 4: meal_reservation ─────────────────────────────────
  const mealRows = reservations.flatMap((r) =>
    (r.meals ?? []).map((m) => ({
      reservation_id: r.id,
      reservation_code: r.reservationCode,
      meal_date: String(m.reservedDate),
      breakfast: m.breakfast,
      lunch: m.lunch,
      dinner: m.dinner,
      special_breakfast: m.specialBreakfast ? 1 : 0,
      special_lunch: m.specialLunch ? 1 : 0,
      special_dinner: m.specialDinner ? 1 : 0,
    }))
  );

  const wsMeal = XLSX.utils.json_to_sheet(mealRows.length > 0 ? mealRows : [{}]);
  wsMeal['!cols'] = [
    { wch: 14 }, { wch: 18 }, { wch: 12 },
    { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 16 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMeal, 'meal_reservation');

  // ── 파일 저장 ─────────────────────────────────────────────────
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  XLSX.writeFile(wb, `예약_DB_${dateStr}.xlsx`);
}
