import { ROOM_INFO } from "@/lib/constants/rooms";
import { RoomReservation } from "@/types/reservation";

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

function openAndPrint(html: string) {
  const win = window.open("", "_blank", "width=900,height=720");
  if (!win) {
    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 300);
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
      <span class="cell-num" style="color:${numColor}">${cell.id}</span>
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
      <span class="cell-num" style="color:${numColor}">${cell.id}</span>
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
    .floor-grid { margin-bottom: 14px; }
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
  <div class="date-heading">${date} ~ ${nextDay(date)}</div>
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
    .floor-grid { margin-bottom: 14px; }
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
      const label = `${startDate} ~ ${nextDay(endDate)}`;
      return `
    <div class="date-block">
      <div class="block-header">
        <h2>${organization}</h2>
        <div class="sub">통합 숙소 배정표 &nbsp;|&nbsp; ${dates[0]} ~ ${nextDay(dates[dates.length - 1])}</div>
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
