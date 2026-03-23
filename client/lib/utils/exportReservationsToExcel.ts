import * as XLSX from 'xlsx';
import { Reservation } from '@/types/reservation';

export function exportReservationsToExcel(reservations: Reservation[]) {
  const rows = reservations.map((r) => {
    const roomCount = r.rooms?.length ?? 0;
    const classroomNames = r.classrooms
      ? [...new Set(r.classrooms.map((c) => c.classroomName))].join(', ')
      : '';
    const mealDays = r.meals?.length ?? 0;

    return {
      '예약코드': r.reservationCode,
      '상태': r.status,
      '단체명': r.organization,
      '목적': r.purpose,
      '인원': r.people,
      '입실일': String(r.startDate),
      '퇴실일': String(r.endDate),
      '담당자': r.customer,
      '연락처': r.customerPhone,
      '연락처2': r.customerPhone2 ?? '',
      '이메일': r.customerEmail ?? '',
      '회사주소': r.companyAddress ?? '',
      '현장담당자': r.siteManager ?? '',
      '현장연락처': r.siteManagerPhone ?? '',
      '강의실': classroomNames,
      '숙박(호실수)': roomCount,
      '식사(일수)': mealDays,
      '메모': r.memo ?? '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // 컬럼 너비 조정
  worksheet['!cols'] = [
    { wch: 18 }, // 예약코드
    { wch: 6 },  // 상태
    { wch: 20 }, // 단체명
    { wch: 14 }, // 목적
    { wch: 6 },  // 인원
    { wch: 12 }, // 입실일
    { wch: 12 }, // 퇴실일
    { wch: 10 }, // 담당자
    { wch: 14 }, // 연락처
    { wch: 14 }, // 연락처2
    { wch: 22 }, // 이메일
    { wch: 24 }, // 회사주소
    { wch: 10 }, // 현장담당자
    { wch: 14 }, // 현장연락처
    { wch: 20 }, // 강의실
    { wch: 10 }, // 숙박
    { wch: 8 },  // 식사
    { wch: 30 }, // 메모
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '예약목록');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  XLSX.writeFile(workbook, `예약목록_${dateStr}.xlsx`);
}
