import { ROOM_INFO } from "@/lib/constants/rooms";
import { Reservation, RoomReservation } from "@/types/reservation";

// ── 공통: 월 달력 날짜 목록 생성 ────────────────────────────────────────────

interface CalDay {
  date: Date;
  dateStr: string;
  isCurrent: boolean;
}

function buildCalDays(year: number, month: number): CalDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);
  const endOffset = (7 - lastDay.getDay()) % 7;
  const endDate = new Date(year, month + 1, endOffset);
  const days: CalDay[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const d = new Date(cur);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ date: d, dateStr, isCurrent: d.getMonth() === month });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

const PRINT_WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function isWeekendDay(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function calThStyle(cal: CalDay) {
  if (!cal.isCurrent) return "background:#f0f0f0;color:#aaa;";
  if (isWeekendDay(cal.date)) return "background:#fff5f5;color:#e53e3e;";
  return "";
}

function calTdStyle(cal: CalDay) {
  if (!cal.isCurrent) return "background:#f8f8f8;";
  if (isWeekendDay(cal.date)) return "background:#fff8f8;";
  return "";
}

const STATUS_COLOR_PRINT = (status: string) =>
  status === "확정" ? "#16a34a" : status === "예약" ? "#d97706" : "#7c3aed";

const LEGEND_HTML =
  `<div class="legend">` +
  `<span class="legend-item"><span class="legend-dot" style="background:#16a34a"></span>확정</span>` +
  `<span class="legend-item"><span class="legend-dot" style="background:#d97706"></span>예약</span>` +
  `<span class="legend-item"><span class="legend-dot" style="background:#7c3aed"></span>문의</span>` +
  `</div>`;

const TABLE_COMMON_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Apple SD Gothic Neo', Arial, sans-serif; font-size: 11px;
         padding: 8mm 10mm; color: #111; background: #fff; }
  h2 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .legend { display: flex; gap: 14px; margin-bottom: 10px; }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #444; }
  .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; display: inline-block; }
  .half-block { margin-bottom: 20px; padding-top: 16px; border-top: 2px solid #d1d5db; }
  .half-block:first-of-type { border-top: none; padding-top: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
  th, td { border: 1px solid #ddd; text-align: center; padding: 2px 1px; vertical-align: middle; }
  .th-org { width: 80px; background: #f5f5f5; font-weight: 700; }
  .th-total { width: 36px; background: #f5f5f5; font-weight: 700; }
  .sub-th { font-size: 8px; background: #fafafa; padding: 2px; }
  .date-num { font-size: 10px; font-weight: 700; }
  .day-label { font-size: 8px; color: #666; }
  .td-org { text-align: left; padding: 3px 6px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .total-cell { font-size: 10px; font-weight: 700; }
  .total-row td { background: #f0f6ff; }
  .total-sub { font-size: 10px; font-weight: 700; background: #f0f6ff; }
  .total-label { font-weight: 700; background: #f0f6ff; }
  .empty-cell { padding: 12px; color: #999; }
  .month-summary { margin-top: 8px; padding: 6px 12px; background: #f5f5f5;
                   border-radius: 4px; font-size: 12px; }
  @page { size: A3 landscape; margin: 8mm 10mm; }
  @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
`;

// ── RoomPickerModal과 동일한 레이아웃 정의 ──────────────────────────────────
interface CellDef {
  id: string;
  isLabel?: boolean;
  row: number;
  col: number;
  colSpan?: number;
}

const LAYOUT: CellDef[] = [
  { id: "109", row: 1, col: 5 },
  { id: "110", row: 1, col: 6 },
  { id: "111", row: 1, col: 7 },
  { id: "화장실", isLabel: true, row: 1, col: 8 },
  { id: "127", row: 1, col: 9 },
  { id: "126", row: 1, col: 10 },
  { id: "108", row: 2, col: 4 },
  { id: "107", row: 3, col: 3 },
  { id: "106", row: 4, col: 2 },
  { id: "105", row: 5, col: 1 },
  { id: "125", row: 2, col: 11 },
  { id: "124", row: 3, col: 12 },
  { id: "123", row: 4, col: 13 },
  { id: "122", row: 5, col: 14 },
  { id: "121", row: 6, col: 15 },
  { id: "120", row: 7, col: 16 },
  { id: "119", row: 8, col: 17 },
  { id: "현관", isLabel: true, row: 6, col: 7, colSpan: 2 },
  { id: "101", row: 6, col: 5 },
  { id: "102", row: 7, col: 4 },
  { id: "103", row: 8, col: 3 },
  { id: "104", row: 9, col: 2 },
  { id: "112", row: 6, col: 10 },
  { id: "113", row: 7, col: 11 },
  { id: "114", row: 8, col: 12 },
  { id: "115", row: 9, col: 13 },
  { id: "116", row: 10, col: 14 },
  { id: "117", row: 11, col: 15 },
  { id: "118", row: 12, col: 16 },
];

const TYPE_COLOR: Record<string, string> = {
  "1인실": "#EC008C",
  "2인실": "#0087D4",
  "4인실": "#F5A623",
};

// ── 공통 유틸 ──────────────────────────────────────────────────────────────

function nextDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
function withDay(dateStr: string): string {
  const d = new Date(dateStr);
  return `${dateStr} (${DAY_NAMES[d.getDay()]})`;
}

function openAndPrint(html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "width=900,height=720");
  if (!win) {
    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    URL.revokeObjectURL(url);
    return;
  }
  win.addEventListener("load", () => {
    win.print();
    URL.revokeObjectURL(url);
  });
}

// 도면 그리드 HTML 생성 (한 날짜)
function buildFloorGridHtml(
  assignedSet: Set<string>,
  cellPx = 46,
  halfRowPx = 22,
): string {
  const gap = 3;
  const cells = LAYOUT.map((cell) => {
    const gridRow = `${cell.row} / span 2`;
    const gridCol = cell.colSpan
      ? `${cell.col} / span ${cell.colSpan}`
      : `${cell.col}`;

    if (cell.isLabel) {
      return `<div class="floor-label" style="grid-row:${gridRow};grid-column:${gridCol}">${cell.id}</div>`;
    }

    const info = ROOM_INFO[cell.id];
    if (!info) return "";
    const assigned = assignedSet.has(cell.id);
    const color = TYPE_COLOR[info.type] ?? "#ccc";
    const bg = assigned ? color : "#d4d4d4";
    const border = assigned ? color : "#aaa";
    const numColor = assigned ? "#fff" : "#555";
    const capColor = assigned ? "rgba(255,255,255,0.85)" : "#777";

    return `<div class="room-cell" style="
      grid-row:${gridRow};grid-column:${gridCol};
      background:${bg};border:2px solid ${border}">
      <span class="cell-num" style="color:${numColor}">${cell.id}호</span>
      <span class="cell-cap" style="color:${capColor}">${info.cap}인</span>
    </div>`;
  }).join("");

  return `
  <div class="floor-grid" style="
    display:grid;
    gap:${gap}px;
    grid-template-columns:repeat(17,${cellPx}px);
    grid-template-rows:repeat(13,${halfRowPx}px);
  ">${cells}</div>`;
}

// 도면 그리드 HTML 생성 (업체 색상별 — 숙박 현황 뷰용)
function buildFloorGridHtmlColored(
  roomColors: Record<string, string>,
  cellPx = 46,
  halfRowPx = 22,
): string {
  const gap = 3;
  const cells = LAYOUT.map((cell) => {
    const gridRow = `${cell.row} / span 2`;
    const gridCol = cell.colSpan
      ? `${cell.col} / span ${cell.colSpan}`
      : `${cell.col}`;

    if (cell.isLabel) {
      return `<div class="floor-label" style="grid-row:${gridRow};grid-column:${gridCol}">${cell.id}</div>`;
    }

    const info = ROOM_INFO[cell.id];
    if (!info) return "";
    const color = roomColors[cell.id];
    const bg = color ?? "#d4d4d4";
    const border = color ?? "#aaa";
    const numColor = color ? "#fff" : "#555";
    const capColor = color ? "rgba(255,255,255,0.85)" : "#777";

    return `<div class="room-cell" style="
      grid-row:${gridRow};grid-column:${gridCol};
      background:${bg};border:2px solid ${border}">
      <span class="cell-num" style="color:${numColor}">${cell.id}호</span>
      <span class="cell-cap" style="color:${capColor}">${info.cap}인</span>
    </div>`;
  }).join("");

  return `
  <div class="floor-grid" style="
    display:grid;
    gap:${gap}px;
    grid-template-columns:repeat(17,${cellPx}px);
    grid-template-rows:repeat(13,${halfRowPx}px);
  ">${cells}</div>`;
}

// ── 숙박 현황 뷰 출력 (업체 색상 기준, 날짜 클릭 모달용) ────────────────────

export function printRoomViewForDate(
  date: string,
  occupiedRooms: string[],
  roomColors: Record<string, string>,
  orgLegend: { color: string; organization: string }[],
) {
  const legend =
    orgLegend
      .map(
        ({ color, organization }) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${color}"></span>
      <span>${organization}</span>
    </div>`,
      )
      .join("") +
    `<div class="legend-item">
      <span class="legend-dot" style="background:#d4d4d4;border:1px solid #aaa"></span>
      <span>미배정</span>
    </div>`;

  const html = `<!DOCTYPE html><html><head>
  <meta charset="UTF-8">
  <title>숙소 현황 – ${date}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Apple SD Gothic Neo', Arial, sans-serif; font-size: 13px;
           padding: 14mm 12mm; color: #111; background: #fff; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 3px; }
    .sub { font-size: 12px; color: #777; margin-bottom: 12px; }
    .legend { display: flex; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #555; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .floor-grid { margin: 0 auto 14px; width: fit-content; }
    .room-cell { display: flex; flex-direction: column; align-items: center;
                 justify-content: center; border-radius: 4px; gap: 1px; }
    .cell-num { font-size: 11px; font-weight: 700; line-height: 1; }
    .cell-cap { font-size: 9px; font-weight: 600; line-height: 1; }
    .floor-label { display: flex; align-items: center; justify-content: center;
                   font-size: 9px; color: #888; border: 1px dashed #ddd;
                   border-radius: 4px; background: #fafafa; }
    .date-heading { font-size: 28px; font-weight: 700; text-align: center;
                    margin: 8px 0 14px; color: #111; letter-spacing: 1px; }
    .summary { margin-top: 10px; padding: 8px 14px; background: #f5f5f5;
               border-radius: 6px; font-size: 13px; color: #333; text-align: center; }
    @page { size: A4 landscape; margin: 10mm 12mm; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  </style>
  </head><body>
  <h2>숙소 현황</h2>
  <div class="sub">숙소 배정표</div>
  <div class="date-heading">${withDay(date)} ~ ${withDay(nextDay(date))}</div>
  <div class="legend">${legend}</div>
  ${buildFloorGridHtmlColored(roomColors)}
  <div class="summary">사용중 <strong>${occupiedRooms.length}</strong>실</div>
  <script>window.onafterprint = function(){ window.close(); }</script>
  </body></html>`;

  openAndPrint(html);
}

// ── 일별 숙소 배정표 ────────────────────────────────────────────────────────

export function printRoomTableForDate(
  date: string,
  rooms: RoomReservation[],
  organization: string,
) {
  const assigned = rooms.filter((r) => r.reservedDate === date);
  const assignedSet = new Set(assigned.map((r) => r.roomNumber));

  const count = (type: string) =>
    assigned.filter((r) => ROOM_INFO[r.roomNumber]?.type === type).length;

  const legend = (Object.entries(TYPE_COLOR) as [string, string][])
    .map(
      ([type, color]) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${color}"></span>
      <span>${type} ${count(type) > 0 ? `(${count(type)}실)` : ""}</span>
    </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head>
  <meta charset="UTF-8">
  <title>숙소 배정표 – ${date}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Apple SD Gothic Neo', Arial, sans-serif; font-size: 13px;
           padding: 14mm 12mm; color: #111; background: #fff; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 3px; }
    .sub { font-size: 12px; color: #777; margin-bottom: 12px; }
    .legend { display: flex; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #555; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .floor-grid { margin: 0 auto 14px; width: fit-content; }
    .room-cell { display: flex; flex-direction: column; align-items: center;
                 justify-content: center; border-radius: 4px; gap: 1px; }
    .cell-num { font-size: 11px; font-weight: 700; line-height: 1; }
    .cell-cap { font-size: 9px; font-weight: 600; line-height: 1; }
    .floor-label { display: flex; align-items: center; justify-content: center;
                   font-size: 9px; color: #888; border: 1px dashed #ddd;
                   border-radius: 4px; background: #fafafa; }
    .date-heading { font-size: 28px; font-weight: 700; text-align: center;
                    margin: 8px 0 14px; color: #111; letter-spacing: 1px; }
    .summary { margin-top: 10px; padding: 8px 14px; background: #f5f5f5;
               border-radius: 6px; font-size: 13px; color: #333; text-align: center; }
    @page { size: A4 landscape; margin: 10mm 12mm; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  </style>
  </head><body>
  <h2>${organization}</h2>
  <div class="sub">숙소 배정표</div>
  <div class="date-heading">${date}</div>
  <div class="legend">${legend}
    <div class="legend-item">
      <span class="legend-dot" style="background:#d4d4d4;border:1px solid #aaa"></span>
      <span>미배정</span>
    </div>
  </div>
  ${buildFloorGridHtml(assignedSet)}
  <div class="summary">
    1인실 <strong>${count("1인실")}</strong>실 &nbsp;·&nbsp;
    2인실 <strong>${count("2인실")}</strong>실 &nbsp;·&nbsp;
    4인실 <strong>${count("4인실")}</strong>실 &nbsp;·&nbsp;
    합계 <strong>${assigned.length}</strong>실
  </div>
  <script>window.onafterprint = function(){ window.close(); }</script>
  </body></html>`;

  openAndPrint(html);
}

// ── 통합 숙소 배정표 (날짜별 도면 나열) ────────────────────────────────────

export function printRoomTableIntegrated(
  dates: string[],
  rooms: RoomReservation[],
  organization: string,
) {
  if (dates.length === 0) {
    alert("날짜가 없습니다.");
    return;
  }
  if (rooms.length === 0) {
    alert("배정된 호실이 없습니다.");
    return;
  }

  // ── 날짜별 호실 키 생성 (정렬된 쉼표 문자열) ──
  const keyOf = (date: string) =>
    rooms
      .filter((r) => r.reservedDate === date)
      .map((r) => r.roomNumber)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .join(",");

  // ── 연속된 날짜 중 호실이 같은 것끼리 그룹화 ──
  type Group = { startDate: string; endDate: string; key: string };
  const groups: Group[] = [];
  for (const date of dates) {
    const key = keyOf(date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.endDate = date;
    } else {
      groups.push({ startDate: date, endDate: date, key });
    }
  }

  const cellPx = 52;
  const halfRowPx = 24;

  const legendHtml = `<div class="legend">
    ${(Object.entries(TYPE_COLOR) as [string, string][])
      .map(
        ([type, color]) =>
          `<div class="legend-item"><span class="legend-dot" style="background:${color}"></span><span>${type} 배정</span></div>`,
      )
      .join("")}
    <div class="legend-item"><span class="legend-dot" style="background:#d4d4d4;border:1px solid #aaa"></span><span>미배정</span></div>
  </div>`;

  const blocks = groups
    .map(({ startDate, endDate, key }) => {
      const assignedSet = new Set(key ? key.split(",") : []);
      const total = assignedSet.size;
      const label = `${withDay(startDate)} ~ ${withDay(nextDay(endDate))}`;
      return `
    <div class="date-block">
      <div class="block-header">
        <h2>${organization}</h2>
        <div class="sub">통합 숙소 배정표 &nbsp;|&nbsp; ${withDay(dates[0])} ~ ${withDay(nextDay(dates[dates.length - 1]))}</div>
        ${legendHtml}
      </div>
      <div class="date-title">${label} <span class="date-count">(${total}실)</span></div>
      ${buildFloorGridHtml(assignedSet, cellPx, halfRowPx)}
    </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head>
  <meta charset="UTF-8">
  <title>통합 숙소 배정표 – ${organization}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Apple SD Gothic Neo', Arial, sans-serif; font-size: 13px;
           padding: 0 10mm; color: #111; background: #fff; }
    h2 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
    .sub { font-size: 12px; color: #777; margin-bottom: 8px; }
    .legend { display: flex; gap: 14px; margin-bottom: 0; }
    .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #555; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .date-block { break-after: page; display: flex; flex-direction: column; align-items: center; padding-top: 10mm; }
    .date-title { font-size: 28px; font-weight: 700; text-align: center;
                  margin: 30px 0 100px; color: #111; letter-spacing: 1px; width: 100%; }
    .date-count { font-size: 16px; font-weight: 400; color: #555; }
    .block-header { width: 100%; }
    .room-cell { display: flex; flex-direction: column; align-items: center;
                 justify-content: center; border-radius: 4px; gap: 1px; }
    .cell-num { font-size: 11px; font-weight: 700; line-height: 1; }
    .cell-cap { font-size: 9px; font-weight: 600; line-height: 1; }
    .floor-label { display: flex; align-items: center; justify-content: center;
                   font-size: 9px; color: #888; border: 1px dashed #ddd;
                   border-radius: 4px; background: #fafafa; }
    @page { size: A4 landscape; margin: 10mm; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  </style>
  </head><body>
  ${blocks}
  <script>window.onafterprint = function(){ window.close(); }</script>
  </body></html>`;

  openAndPrint(html);
}

// ── 식수 현황 월별 인쇄 ────────────────────────────────────────────────────

export function printMealTable(
  year: number,
  month: number,
  reservations: Reservation[],
) {
  const calDays = buildCalDays(year, month);
  const halves: CalDay[][] = [];
  for (let i = 0; i < calDays.length; i += 7) halves.push(calDays.slice(i, i + 7));

  const displayedDates = new Set(calDays.map((c) => c.dateStr));
  const activeRes = reservations.filter((r) => {
    if (r.status === "취소") return false;
    return r.meals?.some((m) => displayedDates.has(String(m.reservedDate)));
  });

  const getOrgMeal = (resId: number, dateStr: string) => {
    const res = reservations.find((r) => r.id === resId);
    return res?.meals?.find((m) => String(m.reservedDate) === dateStr) ?? null;
  };

  const getDayMealTotal = (dateStr: string, type: "breakfast" | "lunch" | "dinner") => {
    let total = 0;
    activeRes.forEach((r) => {
      const meal = getOrgMeal(r.id, dateStr);
      if (meal) total += meal[type];
    });
    return total;
  };

  const halfTablesHtml = halves
    .map((halfDays) => {
      const halfActiveRes = activeRes.filter((res) =>
        halfDays.some((cal) => {
          const meal = getOrgMeal(res.id, cal.dateStr);
          return meal && (meal.breakfast > 0 || meal.lunch > 0 || meal.dinner > 0);
        }),
      );

      const thead =
        `<tr><th class="th-org" rowspan="2">단체명</th>` +
        halfDays
          .map(
            (cal) =>
              `<th colspan="3" style="${calThStyle(cal)}">` +
              `<div class="date-num">${cal.date.getDate()}일</div>` +
              `<div class="day-label">${PRINT_WEEK_DAYS[cal.date.getDay()]}</div></th>`,
          )
          .join("") +
        `<th class="th-total" rowspan="2">식수계</th></tr>` +
        `<tr>` +
        halfDays
          .flatMap((cal) => [
            `<th class="sub-th" style="${calThStyle(cal)}">조</th>`,
            `<th class="sub-th" style="${calThStyle(cal)}">중</th>`,
            `<th class="sub-th" style="${calThStyle(cal)}">석</th>`,
          ])
          .join("") +
        `</tr>`;

      let bodyRows = "";
      if (halfActiveRes.length === 0) {
        bodyRows = `<tr><td colspan="${1 + halfDays.length * 3 + 1}" class="empty-cell">식수 예약이 없습니다.</td></tr>`;
      } else {
        bodyRows = halfActiveRes
          .map((res) => {
            const halfTotal = halfDays.reduce((sum, cal) => {
              const meal = getOrgMeal(res.id, cal.dateStr);
              return sum + (meal ? meal.breakfast + meal.lunch + meal.dinner : 0);
            }, 0);
            const isConfirmed = res.status === "확정";
            const cells = halfDays
              .flatMap((cal) => {
                const meal = getOrgMeal(res.id, cal.dateStr);
                const b = meal?.breakfast ?? 0;
                const l = meal?.lunch ?? 0;
                const d = meal?.dinner ?? 0;
                const sb = meal?.specialBreakfast ?? false;
                const sl = meal?.specialLunch ?? false;
                const sd = meal?.specialDinner ?? false;
                const statusColor = STATUS_COLOR_PRINT(res.status);
                const mealSpan = (count: number, isSpecial: boolean) => {
                  if (count === 0) return "";
                  const color = isSpecial
                    ? isConfirmed ? "#0087D4" : "#F5A623"
                    : statusColor;
                  return `<span style="font-weight:700;color:${color}">${count}</span>`;
                };
                return [
                  `<td class="meal-cell" style="${calTdStyle(cal)}">${mealSpan(b, sb)}</td>`,
                  `<td class="meal-cell" style="${calTdStyle(cal)}">${mealSpan(l, sl)}</td>`,
                  `<td class="meal-cell" style="${calTdStyle(cal)}">${mealSpan(d, sd)}</td>`,
                ];
              })
              .join("");
            return (
              `<tr><td class="td-org" style="border-left:4px solid ${res.colorCode};">${res.organization}</td>` +
              cells +
              `<td class="total-cell">${halfTotal > 0 ? halfTotal : ""}</td></tr>`
            );
          })
          .join("");

        const grandTotal = halfDays.reduce(
          (s, cal) =>
            s +
            getDayMealTotal(cal.dateStr, "breakfast") +
            getDayMealTotal(cal.dateStr, "lunch") +
            getDayMealTotal(cal.dateStr, "dinner"),
          0,
        );
        const totalCells = halfDays
          .flatMap((cal) => {
            const b = getDayMealTotal(cal.dateStr, "breakfast");
            const l = getDayMealTotal(cal.dateStr, "lunch");
            const d = getDayMealTotal(cal.dateStr, "dinner");
            return [
              `<td class="total-sub" style="${calTdStyle(cal)}">${b > 0 ? b : ""}</td>`,
              `<td class="total-sub" style="${calTdStyle(cal)}">${l > 0 ? l : ""}</td>`,
              `<td class="total-sub" style="${calTdStyle(cal)}">${d > 0 ? d : ""}</td>`,
            ];
          })
          .join("");
        bodyRows +=
          `<tr class="total-row"><td class="total-label">합계</td>` +
          totalCells +
          `<td class="total-cell">${grandTotal > 0 ? grandTotal : ""}</td></tr>`;
      }

      return `<div class="half-block"><table><thead>${thead}</thead><tbody>${bodyRows}</tbody></table></div>`;
    })
    .join("");

  const monthDates = calDays.filter((c) => c.isCurrent);
  const monthB = monthDates.reduce((s, c) => s + getDayMealTotal(c.dateStr, "breakfast"), 0);
  const monthL = monthDates.reduce((s, c) => s + getDayMealTotal(c.dateStr, "lunch"), 0);
  const monthD = monthDates.reduce((s, c) => s + getDayMealTotal(c.dateStr, "dinner"), 0);
  const monthTotal = monthB + monthL + monthD;

  const mealHtml =
    `<!DOCTYPE html><html><head><meta charset="UTF-8">` +
    `<title>${year}년 ${month + 1}월 식수 현황</title>` +
    `<style>${TABLE_COMMON_CSS}.meal-cell{font-size:10px;}</style></head><body>` +
    `<h2>${year}년 ${month + 1}월 식수 현황</h2>` +
    LEGEND_HTML +
    halfTablesHtml +
    `<div class="month-summary"><strong>${year}년 ${month + 1}월 합계</strong>&nbsp;&nbsp;` +
    `조식 <strong>${monthB}</strong>&nbsp;·&nbsp;` +
    `중식 <strong>${monthL}</strong>&nbsp;·&nbsp;` +
    `석식 <strong>${monthD}</strong>&nbsp;·&nbsp;` +
    `합계 <strong>${monthTotal}</strong></div>` +
    `<script>window.onafterprint=function(){window.close();}</script>` +
    `</body></html>`;

  openAndPrint(mealHtml);
}

// ── 숙박 현황 월별 인쇄 ────────────────────────────────────────────────────

const ROOM_TYPES_PRINT = ["4인실", "2인실", "1인실"] as const;
type RoomTypePrint = (typeof ROOM_TYPES_PRINT)[number];

export function printAccommodationTable(
  year: number,
  month: number,
  reservations: Reservation[],
) {
  const calDays = buildCalDays(year, month);
  const halves: CalDay[][] = [];
  for (let i = 0; i < calDays.length; i += 7) halves.push(calDays.slice(i, i + 7));

  const displayedDates = new Set(calDays.map((c) => c.dateStr));
  const activeRes = reservations.filter((r) => {
    if (r.status === "취소") return false;
    return r.rooms?.some((rm) => displayedDates.has(String(rm.reservedDate)));
  });

  const getRoomsOnDate = (resId: number, dateStr: string) => {
    const res = reservations.find((r) => r.id === resId);
    return res?.rooms?.filter((rm) => String(rm.reservedDate) === dateStr) ?? [];
  };

  const getDayTypeTotal = (dateStr: string, type: RoomTypePrint) => {
    let total = 0;
    activeRes.forEach((r) => {
      total += getRoomsOnDate(r.id, dateStr).filter((rm) => rm.roomType === type).length;
    });
    return total;
  };

  const getDayRoomTotal = (dateStr: string) =>
    ROOM_TYPES_PRINT.reduce((s, t) => s + getDayTypeTotal(dateStr, t), 0);

  const halfTablesHtml = halves
    .map((halfDays) => {
      const halfActiveRes = activeRes.filter((res) =>
        halfDays.some((cal) => getRoomsOnDate(res.id, cal.dateStr).length > 0),
      );

      const thead =
        `<tr><th class="th-org" rowspan="2">단체명</th>` +
        halfDays
          .map(
            (cal) =>
              `<th colspan="3" style="${calThStyle(cal)}">` +
              `<div class="date-num">${cal.date.getDate()}일</div>` +
              `<div class="day-label">${PRINT_WEEK_DAYS[cal.date.getDay()]}</div></th>`,
          )
          .join("") +
        `<th class="th-total" rowspan="2">합계</th></tr>` +
        `<tr>` +
        halfDays
          .flatMap((cal) => [
            `<th class="sub-th" style="${calThStyle(cal)}">4인</th>`,
            `<th class="sub-th" style="${calThStyle(cal)}">2인</th>`,
            `<th class="sub-th" style="${calThStyle(cal)}">1인</th>`,
          ])
          .join("") +
        `</tr>`;

      let bodyRows = "";
      if (halfActiveRes.length === 0) {
        bodyRows = `<tr><td colspan="${1 + halfDays.length * 3 + 1}" class="empty-cell">숙박 예약이 없습니다.</td></tr>`;
      } else {
        bodyRows = halfActiveRes
          .map((res) => {
            const halfTotal = halfDays.reduce(
              (sum, cal) => sum + getRoomsOnDate(res.id, cal.dateStr).length,
              0,
            );
            const cls = STATUS_COLOR_PRINT(res.status);
            const cells = halfDays
              .flatMap((cal) => {
                const rooms = getRoomsOnDate(res.id, cal.dateStr);
                const c4 = rooms.filter((r) => r.roomType === "4인실").length;
                const c2 = rooms.filter((r) => r.roomType === "2인실").length;
                const c1 = rooms.filter((r) => r.roomType === "1인실").length;
                const span = (n: number) =>
                  n > 0 ? `<span style="font-weight:700;color:${cls}">${n}</span>` : "";
                return [
                  `<td class="room-cell" style="${calTdStyle(cal)}">${span(c4)}</td>`,
                  `<td class="room-cell" style="${calTdStyle(cal)}">${span(c2)}</td>`,
                  `<td class="room-cell" style="${calTdStyle(cal)}">${span(c1)}</td>`,
                ];
              })
              .join("");
            return (
              `<tr><td class="td-org" style="border-left:4px solid ${res.colorCode};">${res.organization}</td>` +
              cells +
              `<td class="total-cell">${halfTotal > 0 ? halfTotal : ""}</td></tr>`
            );
          })
          .join("");

        const grandTotal = halfDays.reduce((s, cal) => s + getDayRoomTotal(cal.dateStr), 0);
        const totalCells = halfDays
          .flatMap((cal) => {
            const t4 = getDayTypeTotal(cal.dateStr, "4인실");
            const t2 = getDayTypeTotal(cal.dateStr, "2인실");
            const t1 = getDayTypeTotal(cal.dateStr, "1인실");
            return [
              `<td class="total-sub" style="${calTdStyle(cal)}">${t4 > 0 ? t4 : ""}</td>`,
              `<td class="total-sub" style="${calTdStyle(cal)}">${t2 > 0 ? t2 : ""}</td>`,
              `<td class="total-sub" style="${calTdStyle(cal)}">${t1 > 0 ? t1 : ""}</td>`,
            ];
          })
          .join("");
        bodyRows +=
          `<tr class="total-row"><td class="total-label">합계</td>` +
          totalCells +
          `<td class="total-cell">${grandTotal > 0 ? grandTotal : ""}</td></tr>`;
      }

      return `<div class="half-block"><table><thead>${thead}</thead><tbody>${bodyRows}</tbody></table></div>`;
    })
    .join("");

  const monthDates = calDays.filter((c) => c.isCurrent);
  const month4 = monthDates.reduce((s, c) => s + getDayTypeTotal(c.dateStr, "4인실"), 0);
  const month2 = monthDates.reduce((s, c) => s + getDayTypeTotal(c.dateStr, "2인실"), 0);
  const month1 = monthDates.reduce((s, c) => s + getDayTypeTotal(c.dateStr, "1인실"), 0);
  const monthTotal = month4 + month2 + month1;

  const accomHtml =
    `<!DOCTYPE html><html><head><meta charset="UTF-8">` +
    `<title>${year}년 ${month + 1}월 숙박 현황</title>` +
    `<style>${TABLE_COMMON_CSS}.room-cell{font-size:10px;}</style></head><body>` +
    `<h2>${year}년 ${month + 1}월 숙박 현황</h2>` +
    LEGEND_HTML +
    halfTablesHtml +
    `<div class="month-summary"><strong>${year}년 ${month + 1}월 합계</strong>&nbsp;&nbsp;` +
    `4인실 <strong>${month4}</strong>&nbsp;·&nbsp;` +
    `2인실 <strong>${month2}</strong>&nbsp;·&nbsp;` +
    `1인실 <strong>${month1}</strong>&nbsp;·&nbsp;` +
    `합계 <strong>${monthTotal}</strong></div>` +
    `<script>window.onafterprint=function(){window.close();}</script>` +
    `</body></html>`;

  openAndPrint(accomHtml);
}
