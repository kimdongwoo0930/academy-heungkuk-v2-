import {
  CLASSROOM_CATEGORIES,
  CLASSROOM_ROOM_TO_CATEGORY,
} from "@/lib/constants/classrooms";
import { RoomType } from "@/lib/constants/rooms";
import { getCachedSettings } from "@/lib/utils/priceSettings";
import { Reservation, RoomReservation } from "@/types/reservation";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlignTable,
  WidthType,
} from "docx";

const ROOM_TYPES: RoomType[] = ["4인실", "2인실", "1인실"];
const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  "4인실": "4인 침대",
  "2인실": "2인 침대",
  "1인실": "1인 침대",
};

// A4 page: 210mm, margins 14mm each side → content 182mm ≈ 10320 twips
const CW = 10320;

function taxOf(n: number) {
  return Math.floor(n * 0.1);
}
function totalOf(n: number) {
  return n + taxOf(n);
}
function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dow = "일월화수목금토"[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dow})`;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  while (d <= e) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getRoomStat(entries: RoomReservation[]) {
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

// ── Border helpers ──────────────────────────────────────────────────
const SOLID = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const solidBorder = { top: SOLID, bottom: SOLID, left: SOLID, right: SOLID };
const noBorder = { top: NONE, bottom: NONE, left: NONE, right: NONE };
const GRAY_BG = { type: ShadingType.CLEAR, color: "auto", fill: "E0E0E0" };
const YELLOW_BG = { type: ShadingType.CLEAR, color: "auto", fill: "FFF3CD" };

const CELL_MARGIN = { top: 0, bottom: 0, left: 50, right: 50 };

// ── Cell builder ────────────────────────────────────────────────────
function cell(
  content: string | Paragraph | Paragraph[],
  options: {
    bold?: boolean;
    size?: number; // half-points (18 = 9pt)
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    borders?: typeof solidBorder;
    shading?: typeof GRAY_BG;
    rowSpan?: number;
    colSpan?: number;
    width?: number; // twips
    vAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
    color?: string;
    underline?: boolean;
  } = {},
): TableCell {
  const children: Paragraph[] = Array.isArray(content)
    ? content
    : content instanceof Paragraph
      ? [content]
      : [
          new Paragraph({
            alignment: options.align ?? AlignmentType.LEFT,
            children: [
              new TextRun({
                text: content,
                bold: options.bold,
                size: options.size ?? 16,
                color: options.color,
                underline: options.underline ? { type: "single" } : undefined,
              }),
            ],
          }),
        ];

  return new TableCell({
    children,
    borders: options.borders ?? solidBorder,
    shading: options.shading,
    rowSpan: options.rowSpan,
    columnSpan: options.colSpan,
    width: options.width
      ? { size: options.width, type: WidthType.DXA }
      : undefined,
    verticalAlign: (options.vAlign ??
      VerticalAlignTable.CENTER) as (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable],
    margins: CELL_MARGIN,
  });
}

// ── Paragraph shorthand ─────────────────────────────────────────────
function p(
  text: string,
  options: {
    bold?: boolean;
    size?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    color?: string;
    underline?: boolean;
    spacing?: { before?: number; after?: number };
  } = {},
) {
  return new Paragraph({
    alignment: options.align,
    spacing: options.spacing,
    children: [
      new TextRun({
        text,
        bold: options.bold,
        size: options.size ?? 18,
        color: options.color,
        underline: options.underline ? { type: "single" } : undefined,
      }),
    ],
  });
}

// ── Logo: Canvas → PNG buffer ───────────────────────────────────────
async function renderLogoBuffer(): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const S = 80;
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d")!;
    const sc = S / 100;
    ctx.fillStyle = "#EC008C";
    ctx.fillRect(5 * sc, 8 * sc, 26 * sc, 26 * sc); // 왼쪽 위 사각형
    ctx.fillRect(5 * sc, 42 * sc, 26 * sc, 26 * sc); // 왼쪽 아래 사각형
    ctx.save();
    ctx.translate(66 * sc, 38 * sc);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-21 * sc, -21 * sc, 42 * sc, 42 * sc); // 오른쪽 다이아몬드
    ctx.restore();
    canvas.toBlob((blob) => {
      blob!.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
    }, "image/png");
  });
}

// ── Section: header (logo | title | supplier) ───────────────────────
async function buildHeader(representative?: string) {
  const logoBuffer = await renderLogoBuffer();
  // Nested supplier table
  const supplierTable = new Table({
    width: { size: 3720, type: WidthType.DXA },
    borders: solidBorder,
    rows: [
      new TableRow({
        height: { value: 230, rule: HeightRule.ATLEAST },
        children: [
          cell("공\n급\n자", {
            bold: true,
            size: 14,
            align: AlignmentType.CENTER,
            rowSpan: 4,
            width: 420,
            vAlign: VerticalAlignTable.CENTER,
          }),
          cell("등 록 번 호", {
            bold: true,
            size: 14,
            align: AlignmentType.CENTER,
            shading: GRAY_BG,
            width: 1300,
          }),
          cell("135 - 85 - 03824", { size: 14, width: 2000 }),
        ],
      }),
      new TableRow({
        height: { value: 200, rule: HeightRule.ATLEAST },
        children: [
          cell("상  호", {
            bold: true,
            size: 14,
            align: AlignmentType.CENTER,
            shading: GRAY_BG,
          }),
          cell("흥국생명보험㈜ 연수원", { size: 14 }),
        ],
      }),
      new TableRow({
        height: { value: 200, rule: HeightRule.ATLEAST },
        children: [
          cell("사업장소재지", {
            bold: true,
            size: 14,
            align: AlignmentType.CENTER,
            shading: GRAY_BG,
          }),
          cell("경기도 용인시 기흥구 중부대로819번길 57-9", { size: 14 }),
        ],
      }),
      new TableRow({
        height: { value: 200, rule: HeightRule.ATLEAST },
        children: [
          cell("대  표", {
            bold: true,
            size: 14,
            align: AlignmentType.CENTER,
            shading: GRAY_BG,
          }),
          cell(representative ?? "임형준", { size: 14 }),
        ],
      }),
    ],
  });

  return new Table({
    width: { size: CW, type: WidthType.DXA },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          // Logo area — icon | text 나란히
          new TableCell({
            borders: noBorder,
            width: { size: 2400, type: WidthType.DXA },
            verticalAlign: VerticalAlignTable.CENTER,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [
              new Table({
                width: { size: 2400, type: WidthType.DXA },
                borders: noBorder,
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: noBorder,
                        width: { size: 600, type: WidthType.DXA },
                        verticalAlign: VerticalAlignTable.CENTER,
                        margins: { top: 0, bottom: 0, left: 60, right: 60 },
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: logoBuffer,
                                transformation: { width: 40, height: 40 },
                                type: "png",
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        borders: noBorder,
                        width: { size: 1800, type: WidthType.DXA },
                        verticalAlign: VerticalAlignTable.CENTER,
                        margins: { top: 0, bottom: 0, left: 60, right: 60 },
                        children: [
                          p("Heungkuk", {
                            bold: true,
                            size: 26,
                            color: "1a1a5e",
                          }),
                          p("Life Insurance", { size: 14, color: "666666" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          // Title
          new TableCell({
            borders: noBorder,
            width: { size: 4200, type: WidthType.DXA },
            verticalAlign: VerticalAlignTable.CENTER,
            margins: CELL_MARGIN,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "견   적   서", bold: true, size: 52 }),
                ],
              }),
            ],
          }),
          // Supplier table
          new TableCell({
            borders: noBorder,
            width: { size: 3720, type: WidthType.DXA },
            verticalAlign: VerticalAlignTable.CENTER,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [supplierTable],
          }),
        ],
      }),
    ],
  });
}

// ── Section: contact info (2-column) ───────────────────────────────
function buildContact(reservation: Reservation, today: string, contact?: { manager: string; phone: string; fax: string; email: string }) {
  const mgr = contact?.manager ?? '김 대 술 소장';
  const phone = contact?.phone ?? '031-283-6157';
  const fax = contact?.fax ?? '031-284-5323';
  const email = contact?.email ?? 'hka6157@naver.com';
  const leftLines = [
    `▶ 견 적 일 자 :  ${today}`,
    `▶ 담 당 자 :  ${reservation.customer} 님`,
    `▶ 연 락 처 :  ${reservation.customerPhone}`,
    ...(reservation.customerPhone2
      ? [`▶ 연 락 처 2 :  ${reservation.customerPhone2}`]
      : []),
    ...(reservation.customerEmail
      ? [`▶ 이 메 일 :  ${reservation.customerEmail}`]
      : []),
  ];
  const rightLines = [
    `▷ 담 당 자 :  ${mgr}`,
    `▷ 연 락 처 :  T. ${phone}(직통)   F. ${fax}`,
    `▷ E - Mail :  ${email}`,
    "▷ 홈페이지 :  http://www.hungkukacademy.co.kr/",
  ];

  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            width: { size: 4800, type: WidthType.DXA },
            margins: CELL_MARGIN,
            children: leftLines.map((t) => p(t, { size: 17 })),
          }),
          new TableCell({
            borders: noBorder,
            width: { size: 5520, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, left: 200, right: 50 },
            children: rightLines.map((t) => p(t, { size: 17 })),
          }),
        ],
      }),
    ],
  });
}

// ── Section: 기본정보 ──────────────────────────────────────────────
function buildInfoTable(reservation: Reservation, nights: number) {
  const rows = [
    ["회  사  명", reservation.organization],
    ["교육 명칭", reservation.purpose ?? ""],
    [
      "사용 기간",
      `${formatDateLong(reservation.startDate)} ~ ${formatDateLong(reservation.endDate)}  (${nights}박${nights + 1}일)`,
    ],
  ];
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    rows: rows.map(
      ([th, td]) =>
        new TableRow({
          height: { value: 240, rule: HeightRule.ATLEAST },
          children: [
            cell(th, {
              bold: true,
              align: AlignmentType.CENTER,
              shading: GRAY_BG,
              width: 1200,
            }),
            cell(td, { width: 9120, colSpan: 3 }),
          ],
        }),
    ),
  });
}

// ── Section: 견적 상세 ─────────────────────────────────────────────
function buildQuoteTable(
  rooms: RoomReservation[],
  classrooms: { classroomName: string; reservedDate: string }[],
  meals: { breakfast: number; lunch: number; dinner: number }[],
) {
  const { prices } = getCachedSettings();
  const ROOM_PRICE = prices.roomPrice;
  const MEAL_PRICE = prices.mealPrice;
  const SPECIAL_MEAL_PRICE = prices.specialMealPrice;
  const CLASSROOM_PRICE: Record<string, { label: string; pricePerDay: number }> = Object.fromEntries(
    Object.entries(prices.classrooms).map(([k, v]) => [k, { label: k, pricePerDay: v as number }])
  );
  // Column widths (total = CW = 10320)
  const W = {
    cat: 750,
    spec: 2400,
    qty: 1500,
    price: 1400,
    supply: 1420,
    tax: 1420,
    total: 1430,
  };

  // Header row
  const headerRow = new TableRow({
    height: { value: 180, rule: HeightRule.ATLEAST },
    tableHeader: true,
    children: [
      cell("품  목", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: W.cat,
      }),
      cell("규  격", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: W.spec,
      }),
      cell("수  량", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: W.qty,
      }),
      cell("단  가", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: W.price,
      }),
      cell("공급가액", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: W.supply,
      }),
      cell("세  액", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: W.tax,
      }),
      cell("합  계", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: W.total,
      }),
    ],
  });

  // 숙박비 rows
  const roomRowData = ROOM_TYPES.map((type) => {
    const entries = rooms.filter((r) => r.roomType === type);
    const stat = getRoomStat(entries);
    const supply = stat ? stat.total * ROOM_PRICE : 0;
    return { type, stat, supply };
  });
  const roomSupply = roomRowData.reduce((s, r) => s + r.supply, 0);

  const roomRows = roomRowData.map((r, i) => {
    const qtyText = r.stat
      ? r.stat.nights !== null
        ? `${r.stat.nights} 박  ${r.stat.rooms} 실`
        : `총 ${r.stat.total} 박실`
      : "박      실";
    return new TableRow({
      height: { value: 120, rule: HeightRule.ATLEAST },
      children: [
        ...(i === 0
          ? [
              cell("숙박비", {
                bold: true,
                align: AlignmentType.CENTER,
                shading: YELLOW_BG,
                rowSpan: 3,
                width: W.cat,
              }),
            ]
          : []),
        cell(ROOM_TYPE_LABEL[r.type], {
          width: W.spec,
          align: AlignmentType.CENTER,
        }),
        cell(qtyText, { align: AlignmentType.CENTER, width: W.qty }),
        cell(fmt(ROOM_PRICE), { align: AlignmentType.RIGHT, width: W.price }),
        cell(r.stat ? fmt(r.supply) : "-", {
          align: AlignmentType.RIGHT,
          width: W.supply,
        }),
        cell(r.stat ? fmt(taxOf(r.supply)) : "-", {
          align: AlignmentType.RIGHT,
          width: W.tax,
        }),
        cell(r.stat ? fmt(totalOf(r.supply)) : "-", {
          align: AlignmentType.RIGHT,
          width: W.total,
        }),
      ],
    });
  });

  // 강의실비 rows
  const classroomRows = CLASSROOM_CATEGORIES.map((cat, i) => {
    const entries = classrooms.filter(
      (c) => CLASSROOM_ROOM_TO_CATEGORY[c.classroomName] === cat,
    );
    const uniqueDates = new Set(entries.map((e) => e.reservedDate)).size;
    const uniqueRooms = new Set(entries.map((e) => e.classroomName)).size;
    const totalEntries = entries.length;
    const info = CLASSROOM_PRICE[cat];
    const supply = totalEntries > 0 ? totalEntries * info.pricePerDay : 0;
    const qtyText =
      totalEntries > 0 ? `${uniqueDates} 일  ${uniqueRooms} 실` : "일      실";
    return new TableRow({
      height: { value: 120, rule: HeightRule.ATLEAST },
      children: [
        ...(i === 0
          ? [
              cell("강의실비", {
                bold: true,
                align: AlignmentType.CENTER,
                shading: YELLOW_BG,
                rowSpan: CLASSROOM_CATEGORIES.length,
                width: W.cat,
              }),
            ]
          : []),
        cell(info.label, { width: W.spec, align: AlignmentType.CENTER }),
        cell(qtyText, { align: AlignmentType.CENTER, width: W.qty }),
        cell(fmt(info.pricePerDay), {
          align: AlignmentType.RIGHT,
          width: W.price,
        }),
        cell(totalEntries > 0 ? fmt(supply) : "-", {
          align: AlignmentType.RIGHT,
          width: W.supply,
        }),
        cell(totalEntries > 0 ? fmt(taxOf(supply)) : "-", {
          align: AlignmentType.RIGHT,
          width: W.tax,
        }),
        cell(totalEntries > 0 ? fmt(totalOf(supply)) : "-", {
          align: AlignmentType.RIGHT,
          width: W.total,
        }),
      ],
    });
  });
  const classroomSupply = classroomRows.reduce((s, _row, i) => {
    const cat = CLASSROOM_CATEGORIES[i];
    const entries = classrooms.filter(
      (c) => CLASSROOM_ROOM_TO_CATEGORY[c.classroomName] === cat,
    );
    return s + entries.length * CLASSROOM_PRICE[cat].pricePerDay;
  }, 0);
  const facilitySupply = roomSupply + classroomSupply;

  // 시설 계
  const facilityTotal = new TableRow({
    height: { value: 160, rule: HeightRule.ATLEAST },
    children: [
      cell("시  설  계", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: YELLOW_BG,
        colSpan: 4,
      }),
      cell(fmt(facilitySupply), {
        bold: true,
        align: AlignmentType.RIGHT,
        shading: GRAY_BG,
      }),
      cell(fmt(taxOf(facilitySupply)), {
        bold: true,
        align: AlignmentType.RIGHT,
        shading: GRAY_BG,
      }),
      cell(fmt(totalOf(facilitySupply)), {
        bold: true,
        align: AlignmentType.RIGHT,
        shading: GRAY_BG,
      }),
    ],
  });

  // 식비
  const totalMeals = meals.reduce(
    (s, m) => s + m.breakfast + m.lunch + m.dinner,
    0,
  );
  const mealSupply = totalMeals * MEAL_PRICE;

  const mealRow1 = new TableRow({
    height: { value: 120, rule: HeightRule.ATLEAST },
    children: [
      cell("식비", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: YELLOW_BG,
        rowSpan: 2,
        width: W.cat,
      }),
      cell("일반식 기준", { width: W.spec, align: AlignmentType.CENTER }),
      cell(totalMeals > 0 ? `${fmt(totalMeals)} 식` : "식", {
        align: AlignmentType.CENTER,
        width: W.qty,
      }),
      cell(fmt(MEAL_PRICE), { align: AlignmentType.RIGHT, width: W.price }),
      cell(mealSupply > 0 ? fmt(mealSupply) : "-", {
        align: AlignmentType.RIGHT,
        width: W.supply,
      }),
      cell(mealSupply > 0 ? fmt(taxOf(mealSupply)) : "-", {
        align: AlignmentType.RIGHT,
        width: W.tax,
      }),
      cell(mealSupply > 0 ? fmt(totalOf(mealSupply)) : "-", {
        align: AlignmentType.RIGHT,
        width: W.total,
      }),
    ],
  });
  const mealRow2 = new TableRow({
    height: { value: 120, rule: HeightRule.ATLEAST },
    children: [
      cell("특식", { width: W.spec, align: AlignmentType.CENTER }),
      cell("식", { align: AlignmentType.CENTER, width: W.qty }),
      cell(fmt(SPECIAL_MEAL_PRICE), {
        align: AlignmentType.RIGHT,
        width: W.price,
      }),
      cell("-", { align: AlignmentType.CENTER, width: W.supply }),
      cell("-", { align: AlignmentType.CENTER, width: W.tax }),
      cell("-", { align: AlignmentType.CENTER, width: W.total }),
    ],
  });

  // 식비 계
  const mealTotal = new TableRow({
    height: { value: 160, rule: HeightRule.ATLEAST },
    children: [
      cell("식  비  계", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: YELLOW_BG,
        colSpan: 4,
      }),
      cell(mealSupply > 0 ? fmt(mealSupply) : "-", {
        bold: true,
        align: AlignmentType.RIGHT,
        shading: GRAY_BG,
      }),
      cell(mealSupply > 0 ? fmt(taxOf(mealSupply)) : "-", {
        bold: true,
        align: AlignmentType.RIGHT,
        shading: GRAY_BG,
      }),
      cell(mealSupply > 0 ? fmt(totalOf(mealSupply)) : "-", {
        bold: true,
        align: AlignmentType.RIGHT,
        shading: GRAY_BG,
      }),
    ],
  });

  // 시설+식비 계
  const grandTotal = facilitySupply + mealSupply;
  const grandTotalRow = new TableRow({
    height: { value: 180, rule: HeightRule.ATLEAST },
    children: [
      cell("시 설 + 식 비 계", {
        bold: true,
        size: 20,
        align: AlignmentType.CENTER,
        shading: YELLOW_BG,
        colSpan: 4,
      }),
      cell(fmt(grandTotal), {
        bold: true,
        size: 20,
        align: AlignmentType.RIGHT,
        shading: YELLOW_BG,
      }),
      cell(fmt(taxOf(grandTotal)), {
        bold: true,
        size: 20,
        align: AlignmentType.RIGHT,
        shading: YELLOW_BG,
      }),
      cell(fmt(totalOf(grandTotal)), {
        bold: true,
        size: 20,
        align: AlignmentType.RIGHT,
        shading: YELLOW_BG,
      }),
    ],
  });

  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      headerRow,
      ...roomRows,
      ...classroomRows,
      facilityTotal,
      mealRow1,
      mealRow2,
      mealTotal,
      grandTotalRow,
    ],
  });
}

// ── Section: 식수 현황 ─────────────────────────────────────────────
function buildMealTable(
  meals: {
    reservedDate: string;
    breakfast: number;
    lunch: number;
    dinner: number;
  }[],
  dateRange: string[],
) {
  const mealByDate = Object.fromEntries(meals.map((m) => [m.reservedDate, m]));
  const totalMeals = meals.reduce(
    (s, m) => s + m.breakfast + m.lunch + m.dinner,
    0,
  );

  const colWidth = Math.floor((CW - 900 - 900) / dateRange.length);

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell("구 분", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: 900,
      }),
      ...dateRange.map((d) => {
        const dd = new Date(d + "T00:00:00");
        const label = `${dd.getDate()}일(${"일월화수목금토"[dd.getDay()]})`;
        return cell(label, {
          bold: true,
          align: AlignmentType.CENTER,
          shading: GRAY_BG,
          width: colWidth,
          size: 16,
        });
      }),
      cell("식수계", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: 900,
      }),
    ],
  });

  const keys = ["breakfast", "lunch", "dinner"] as const;
  const labels = ["조식", "중식", "석식"];

  const dataRows = keys.map((key, idx) => {
    const rowTotal = dateRange.reduce(
      (s, d) => s + (mealByDate[d]?.[key] ?? 0),
      0,
    );
    return new TableRow({
      height: { value: 230, rule: HeightRule.ATLEAST },
      children: [
        cell(labels[idx], { align: AlignmentType.CENTER, width: 900 }),
        ...dateRange.map((d) =>
          cell(String(mealByDate[d]?.[key] || "-"), {
            align: AlignmentType.RIGHT,
            width: colWidth,
            size: 16,
          }),
        ),
        cell(String(rowTotal || "-"), {
          align: AlignmentType.RIGHT,
          width: 900,
        }),
      ],
    });
  });

  const subtotalRow = new TableRow({
    height: { value: 230, rule: HeightRule.ATLEAST },
    children: [
      cell("소계", {
        bold: true,
        align: AlignmentType.CENTER,
        shading: GRAY_BG,
        width: 900,
      }),
      ...dateRange.map((d) => {
        const m = mealByDate[d];
        const t = m ? m.breakfast + m.lunch + m.dinner : 0;
        return cell(String(t || "-"), {
          bold: true,
          align: AlignmentType.RIGHT,
          shading: GRAY_BG,
          width: colWidth,
          size: 16,
        });
      }),
      cell(String(totalMeals || "-"), {
        bold: true,
        align: AlignmentType.RIGHT,
        shading: GRAY_BG,
        width: 900,
      }),
    ],
  });

  return new Table({
    width: { size: CW, type: WidthType.DXA },
    rows: [headerRow, ...dataRows, subtotalRow],
  });
}

// ── Section: 유의사항 ──────────────────────────────────────────────
function buildNotes() {
  const lines = [
    { text: "▶시설 이용시 유의사항", bold: true },
    {
      text: "▹ 특식은 별도 예약 바라며 10일 전 확정되어야 합니다.(070 - 8915 - 0872 장지원 점장)",
    },
    {
      text: "** 식당 운영 시간 : 조식(07:30~08:30), 중식(12:00~13:00), 석식(18:00~19:00)",
    },
    {
      text: "** 식사는 예약제로 운영되기때문에 신청 인원에서 변동이 있을 경우 입소 4일전 오전 10시까지 확정 통보하여 주시기 바랍니다.",
    },
    {
      text: "   (통보가 없을 시 신청인원으로 청구되며, 인원초과시는 초과 인원으로 정산합니다.)",
    },
    {
      text: "** 시설(강의실,숙박)과 식당의 사업자가 달라 결제가 별도로 진행되는 점 참고하여 주시기 바랍니다.",
    },
    { text: "▷ 기타", bold: true },
    { text: "** 생활관(숙소) : 입실(13시) / 퇴실(09:30)" },
    { text: "** 연수원내 바베큐 행사 및 취사 불가" },
    { text: "** 퇴소일이 주말, 공휴일일 경우 전일 정산합니다." },
  ];

  return new Table({
    width: { size: CW, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: solidBorder,
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: lines.map(
              (l) =>
                new Paragraph({
                  spacing: { before: 10, after: 10 },
                  children: [
                    new TextRun({ text: l.text, bold: l.bold, size: 17 }),
                  ],
                }),
            ),
          }),
        ],
      }),
    ],
  });
}

// ── Main export ────────────────────────────────────────────────────
export async function exportQuoteToDocx(reservation: Reservation) {
  const rooms = reservation.rooms ?? [];
  const classrooms = reservation.classrooms ?? [];
  const meals = reservation.meals ?? [];
  const { contact } = getCachedSettings();


  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const nights = Math.ceil(
    (new Date(reservation.endDate + "T00:00:00").getTime() -
      new Date(reservation.startDate + "T00:00:00").getTime()) /
      86_400_000,
  );

  const dateRange = getDatesInRange(reservation.startDate, reservation.endDate);

  const SP = (before = 40) => ({ before, after: 0 });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in twips
            margin: { top: 425, bottom: 425, left: 680, right: 680 },
          },
        },
        children: [
          // ── 헤더 ──
          await buildHeader(contact.representative),

          // ── 수신자 ──
          new Paragraph({
            spacing: SP(40),
            children: [
              new TextRun({
                text: `${reservation.organization}  귀중`,
                bold: true,
                size: 26,
                underline: { type: "single" },
              }),
            ],
          }),

          // ── 연락처 ──
          buildContact(reservation, today, contact),

          new Paragraph({ spacing: SP(30) }),

          // ── 기본정보 ──
          buildInfoTable(reservation, nights),

          new Paragraph({ spacing: SP(30) }),

          // ── 견적 상세 ──
          buildQuoteTable(rooms, classrooms, meals),

          // ── 식수 현황 ──
          new Paragraph({
            spacing: SP(30),
            children: [
              new TextRun({
                text: "▶ 식수 현황(일반식)",
                bold: true,
                size: 18,
              }),
            ],
          }),
          buildMealTable(meals, dateRange),

          // ── 유의사항 상단 문구 ──
          new Paragraph({
            spacing: SP(30),
            children: [
              new TextRun({
                text: "★대관견적서 이메일 전송 후 연수원 시설 사용여부를 15일이내 이메일로 재전송 부탁드립니다",
                bold: true,
                size: 16,
              }),
            ],
          }),
          new Paragraph({
            spacing: SP(20),
            children: [
              new TextRun({
                text: "(대관계약서는 별도로 없고 대관확인서 작성 후 서명 및 도장날인이 완료되면 예약완료됩니다)",
                bold: true,
                size: 16,
                color: "CC0000",
              }),
            ],
          }),

          // ── 유의사항 박스 ──
          buildNotes(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `견적서_${reservation.organization}_${reservation.startDate}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
