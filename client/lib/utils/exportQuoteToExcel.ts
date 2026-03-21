import * as XLSX from 'xlsx';
import { Reservation, RoomReservation } from '@/types/reservation';
import { RoomType } from '@/lib/constants/rooms';
import { CLASSROOM_CATEGORIES } from '@/lib/constants/classrooms';
import { getCachedSettings } from '@/lib/utils/priceSettings';
const ROOM_TYPES: RoomType[] = ['4인실', '2인실', '1인실'];
const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  '4인실': '4인 침대',
  '2인실': '2인 침대',
  '1인실': '1인 침대',
};

function taxOf(n: number) { return Math.floor(n * 0.1); }
function totalOf(n: number) { return n + taxOf(n); }

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dow = '일월화수목금토'[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dow})`;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  while (d <= e) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getRoomStat(entries: RoomReservation[]) {
  if (!entries.length) return null;
  const uniqueRooms = new Set(entries.map(e => e.roomNumber)).size;
  const total = entries.length;
  const nightsEach = total / uniqueRooms;
  return {
    nights: Number.isInteger(nightsEach) ? nightsEach : null,
    rooms: uniqueRooms,
    total,
  };
}

export function exportQuoteToExcel(reservation: Reservation) {
  const rooms = reservation.rooms ?? [];
  const classrooms = reservation.classrooms ?? [];
  const meals = reservation.meals ?? [];

  const { prices, contact } = getCachedSettings();
  const ROOM_PRICE = prices.roomPrice;
  const MEAL_PRICE = prices.mealPrice;
  const SPECIAL_MEAL_PRICE = prices.specialMealPrice;
  const CLASSROOM_PRICE: Record<string, { label: string; pricePerDay: number }> = Object.fromEntries(
    Object.entries(prices.classrooms).map(([k, v]) => [k, { label: k, pricePerDay: v as number }])
  );

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  const nights = Math.ceil(
    (new Date(reservation.endDate + 'T00:00:00').getTime() -
      new Date(reservation.startDate + 'T00:00:00').getTime()) / 86_400_000,
  );

  // 숙박비 계산
  const roomRows = ROOM_TYPES.flatMap(type => {
    const entries = rooms.filter(r => r.roomType === type);
    const stat = getRoomStat(entries);
    if (!stat) return [];
    const supply = stat.total * ROOM_PRICE;
    return [{ type, stat, supply }];
  });
  const roomSupply = roomRows.reduce((s, r) => s + r.supply, 0);

  // 강의실비 계산
  const clsMap: Record<string, number> = {};
  classrooms.forEach(c => {
    clsMap[c.classroomName] = (clsMap[c.classroomName] ?? 0) + 1;
  });
  const classroomRows = CLASSROOM_CATEGORIES.map(cat => {
    const days = clsMap[cat] ?? 0;
    const info = CLASSROOM_PRICE[cat];
    const supply = days > 0 ? days * info.pricePerDay : 0;
    return { cat, days, info, supply };
  });
  const classroomSupply = classroomRows.reduce((s, r) => s + r.supply, 0);
  const facilitySupply = roomSupply + classroomSupply;

  // 식비 계산
  const totalMeals = meals.reduce((s, m) => s + m.breakfast + m.lunch + m.dinner, 0);
  const mealSupply = totalMeals * MEAL_PRICE;

  // 식수 현황
  const dateRange = getDatesInRange(reservation.startDate, reservation.endDate);
  const mealByDate = Object.fromEntries(meals.map(m => [m.reservedDate, m]));

  const data: (string | number)[][] = [];

  // 헤더
  data.push(['흥국생명보험㈜ 연수원  견적서']);
  data.push([]);
  data.push(['견적일자', today, '', '수신', reservation.organization]);
  data.push(['담당자(연수원)', contact.manager, '', '담당자', reservation.customer]);
  data.push(['연락처(연수원)', contact.phone, '', '연락처', reservation.customerPhone]);
  data.push([]);

  // 기본정보
  data.push(['회사명', reservation.organization]);
  data.push(['교육명칭', reservation.purpose ?? '']);
  data.push(['사용기간', `${formatDateLong(reservation.startDate)} ~ ${formatDateLong(reservation.endDate)} (${nights}박${nights + 1}일)`]);
  data.push([]);

  // 견적 상세 헤더
  data.push(['품목', '규격', '수량', '단가', '공급가액', '세액', '합계']);

  // 숙박비
  roomRows.forEach((r, i) => {
    const qty = r.stat.nights !== null ? `${r.stat.nights}박 ${r.stat.rooms}실` : `총 ${r.stat.total}박실`;
    data.push([
      i === 0 ? '숙박비' : '',
      ROOM_TYPE_LABEL[r.type],
      qty,
      ROOM_PRICE,
      r.supply,
      taxOf(r.supply),
      totalOf(r.supply),
    ]);
  });
  if (roomRows.length === 0) {
    data.push(['숙박비', '-', '-', '-', '-', '-', '-']);
  }

  // 강의실비
  classroomRows.forEach((c, i) => {
    data.push([
      i === 0 ? '강의실비' : '',
      c.info.label,
      c.days > 0 ? `${c.days}일 1실` : '일  실',
      c.info.pricePerDay,
      c.days > 0 ? c.supply : '-',
      c.days > 0 ? taxOf(c.supply) : '-',
      c.days > 0 ? totalOf(c.supply) : '-',
    ]);
  });

  // 시설 계
  data.push(['시설 계', '', '', '', facilitySupply, taxOf(facilitySupply), totalOf(facilitySupply)]);

  // 식비
  data.push(['식비', '일반식 기준', totalMeals > 0 ? `${totalMeals}식` : '식', MEAL_PRICE,
    mealSupply > 0 ? mealSupply : '-',
    mealSupply > 0 ? taxOf(mealSupply) : '-',
    mealSupply > 0 ? totalOf(mealSupply) : '-',
  ]);
  data.push(['', '특식', '식', SPECIAL_MEAL_PRICE, '-', '-', '-']);

  // 식비 계
  data.push(['식비 계', '', '', '',
    mealSupply > 0 ? mealSupply : '-',
    mealSupply > 0 ? taxOf(mealSupply) : '-',
    mealSupply > 0 ? totalOf(mealSupply) : '-',
  ]);

  // 시설 + 식비 계
  data.push(['시설 + 식비 계', '', '', '',
    facilitySupply + mealSupply,
    taxOf(facilitySupply + mealSupply),
    totalOf(facilitySupply + mealSupply),
  ]);

  data.push([]);

  // 식수 현황
  data.push(['▶ 식수 현황(일반식)']);
  const mealHeader = ['구분', ...dateRange.map(d => {
    const dd = new Date(d + 'T00:00:00');
    return `${dd.getDate()}일(${'일월화수목금토'[dd.getDay()]})`;
  }), '식수계'];
  data.push(mealHeader);

  (['breakfast', 'lunch', 'dinner'] as const).forEach((key, idx) => {
    const labels = ['조식', '중식', '석식'];
    const rowTotal = dateRange.reduce((s, d) => s + (mealByDate[d]?.[key] ?? 0), 0);
    data.push([
      labels[idx],
      ...dateRange.map(d => mealByDate[d]?.[key] || '-'),
      rowTotal || '-',
    ]);
  });
  const subtotal = ['소계', ...dateRange.map(d => {
    const m = mealByDate[d];
    return m ? m.breakfast + m.lunch + m.dinner : '-';
  }), totalMeals || '-'];
  data.push(subtotal);

  // 워크시트 생성
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '견적서');

  // 열 너비 설정
  ws['!cols'] = [
    { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 12 }, { wch: 14 },
  ];

  const fileName = `견적서_${reservation.organization}_${reservation.startDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
