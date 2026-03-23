import * as XLSX from 'xlsx';

export function downloadReservationTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: reservation ──────────────────────────────────────
  const reservationSample = [
    {
      reservation_code: 'HK-20260401-001',
      organization: '삼성생명 연수팀',
      purpose: '신입사원 교육',
      '인원수': 30,
      customer: '홍길동',
      customer_phone: '010-1234-5678',
      customer_phone2: '',
      customer_email: 'hong@samsung.com',
      start_date: '2026-04-01',
      end_date: '2026-04-03',
      color_code: '#4F86C6',
      status: '확정',
      company_address: '서울시 강남구 테헤란로 123',
      site_manager: '김현장',
      site_manager_phone: '010-9999-8888',
      memo: '채식 메뉴 요청',
    },
  ];
  const wsReservation = XLSX.utils.json_to_sheet(reservationSample);
  wsReservation['!cols'] = [
    { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 6 },
    { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 24 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 6 },
    { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsReservation, 'reservation');

  // ── Sheet 2: room_reservation ─────────────────────────────────
  // room_number: 101~104, 201~208, 301~308, 401~404
  const roomSample = [
    { reservation_code: 'HK-20260401-001', room_number: '201', reserved_date: '2026-04-01' },
    { reservation_code: 'HK-20260401-001', room_number: '202', reserved_date: '2026-04-01' },
    { reservation_code: 'HK-20260401-001', room_number: '201', reserved_date: '2026-04-02' },
  ];
  const wsRoom = XLSX.utils.json_to_sheet(roomSample);
  wsRoom['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsRoom, 'room_reservation');

  // ── Sheet 3: classroom_reservation ───────────────────────────
  const classroomSample = [
    { reservation_code: 'HK-20260401-001', classroom: '105', reserved_date: '2026-04-01' },
    { reservation_code: 'HK-20260401-001', classroom: '105', reserved_date: '2026-04-02' },
  ];
  const wsClassroom = XLSX.utils.json_to_sheet(classroomSample);
  wsClassroom['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsClassroom, 'classroom_reservation');

  // ── Sheet 4: meal_reservation ─────────────────────────────────
  // special_breakfast/lunch/dinner: 0 = 일반, 1 = 특식
  const mealSample = [
    { reservation_code: 'HK-20260401-001', meal_date: '2026-04-01', breakfast: 0, lunch: 30, dinner: 30, special_breakfast: 0, special_lunch: 0, special_dinner: 0 },
    { reservation_code: 'HK-20260401-001', meal_date: '2026-04-02', breakfast: 30, lunch: 30, dinner: 0, special_breakfast: 0, special_lunch: 0, special_dinner: 0 },
  ];
  const wsMeal = XLSX.utils.json_to_sheet(mealSample);
  wsMeal['!cols'] = [
    { wch: 18 }, { wch: 12 },
    { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 16 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMeal, 'meal_reservation');

  XLSX.writeFile(wb, '예약_입력_템플릿.xlsx');
}
