"use client";

import ReservationModal from "@/components/reservation/ReservationModal";
import ReservationTooltip from "@/components/scheduler/ReservationTooltip";
import {
  getReservations,
  toRequestBody,
  updateReservation,
} from "@/lib/api/reservation";
import { Reservation } from "@/types/reservation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const HOLIDAYS = new Set([
  "2025-01-01",
  "2025-01-28",
  "2025-01-29",
  "2025-01-30",
  "2025-03-01",
  "2025-05-05",
  "2025-05-06",
  "2025-06-06",
  "2025-08-15",
  "2025-10-03",
  "2025-10-05",
  "2025-10-06",
  "2025-10-07",
  "2025-10-09",
  "2025-12-25",
  "2026-01-01",
  "2026-02-17",
  "2026-02-18",
  "2026-02-19",
  "2026-03-01",
  "2026-05-05",
  "2026-05-24",
  "2026-06-06",
  "2026-08-15",
  "2026-09-24",
  "2026-09-25",
  "2026-09-26",
  "2026-10-03",
  "2026-10-09",
  "2026-12-25",
]);

const CLASSROOM_GROUPS = [
  { type: "대강의실", bg: "bgYellow", rooms: [{ id: "105", cap: 120 }] },
  {
    type: "중강의실",
    bg: "bgYellow",
    rooms: [
      { id: "201", cap: 70 },
      { id: "203", cap: 50 },
      { id: "204", cap: 50 },
    ],
  },
  {
    type: "소강의실",
    bg: "bgYellow",
    rooms: [
      { id: "101", cap: 30 },
      { id: "102", cap: 20 },
      { id: "103", cap: 30 },
      { id: "202", cap: 30 },
    ],
  },
  {
    type: "분임실",
    bg: "bgGreen",
    rooms: [
      { id: "106", cap: 12 },
      { id: "107", cap: 12 },
      { id: "205", cap: 12 },
      { id: "206", cap: 12 },
    ],
  },
  {
    type: "다목적실",
    bg: "bgBlue",
    rooms: [
      { id: "A", cap: 80 },
      { id: "B", cap: 40 },
    ],
  },
  { type: "운동장", bg: "bgOrange", rooms: [{ id: "-", cap: null }] },
  {
    type: "숙박",
    bg: "bgWhite",
    rooms: [
      { id: "1인실", cap: null },
      { id: "2인실", cap: null },
      { id: "4인실", cap: null },
    ],
  },
];

const TYPE_W = 38;
const ROOM_W = 28;
const CAP_W = 20;
const DATE_COL = 36;

function makeDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface CalDay {
  date: Date;
  dateStr: string;
  isCurrent: boolean; // 이번 달 여부
}

export default function SchedulerPage() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);

  const fetchReservations = () =>
    getReservations()
      .then(setReservations)
      .catch(() => alert("예약 데이터를 불러오는데 실패했습니다."));

  useEffect(() => {
    fetchReservations();
  }, []);

  // ── 달력 그리드 생성 (일요일 시작) ──
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=일
  const lastDate = new Date(year, month + 1, 0).getDate();
  const lastDayOfWeek = new Date(year, month + 1, 0).getDay(); // 마지막 날 요일

  const calDays: CalDay[] = [];

  // 전달 채움 (0일 = 전달 마지막, -1 = 전달 마지막-1, ...)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    calDays.push({ date: d, dateStr: makeDateStr(d), isCurrent: false });
  }
  // 이번 달
  for (let i = 1; i <= lastDate; i++) {
    const d = new Date(year, month, i);
    calDays.push({ date: d, dateStr: makeDateStr(d), isCurrent: true });
  }
  // 다음 달 채움 (마지막 주 토요일까지, 최대 35일=5주)
  const trailing = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek;
  for (let i = 1; i <= trailing; i++) {
    const d = new Date(year, month + 1, i);
    calDays.push({ date: d, dateStr: makeDateStr(d), isCurrent: false });
  }

  // 절반씩 나누기 — 대부분 17~18일씩
  const half1 = Math.ceil(calDays.length / 2);
  const halves: CalDay[][] = [
    calDays.slice(0, half1),
    calDays.slice(half1),
  ].filter((h) => h.length > 0);

  // ── 스타일 헬퍼 ──
  const isRedDay = (dateStr: string, date: Date) =>
    date.getDay() === 0 || date.getDay() === 6 || HOLIDAYS.has(dateStr);

  const thCls = (cal: CalDay) => {
    if (!cal.isCurrent) return styles.otherMonthTh;
    if (isRedDay(cal.dateStr, cal.date)) return styles.weekendTh;
    return "";
  };

  const tdCls = (cal: CalDay) => {
    if (!cal.isCurrent) return styles.otherMonthCol;
    if (isRedDay(cal.dateStr, cal.date)) return styles.weekendCol;
    return "";
  };

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  const handleSave = async (data: Reservation) => {
    try {
      const body = toRequestBody(data);
      await updateReservation(data.id, body);
      setEditTarget(null);
      fetchReservations();
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // ── 데이터 조회 ──
  const getClassroomRes = (roomId: string, dateStr: string) =>
    reservations.find(
      (r) =>
        r.status !== "취소" &&
        r.classrooms?.some(
          (c) =>
            c.classroomName === roomId && String(c.reservedDate) === dateStr,
        ),
    );

  const getRoomCount = (dateStr: string, type: string) => {
    let count = 0;
    reservations.forEach((r) => {
      if (r.status !== "취소")
        r.rooms?.forEach((rm) => {
          if (String(rm.reservedDate) === dateStr && rm.roomType === type)
            count++;
        });
    });
    return count;
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>일정 현황</h2>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={prevMonth}>
            ‹
          </button>
          <span className={styles.monthLabel}>
            {year}년 {month + 1}월
          </span>
          <button className={styles.navBtn} onClick={nextMonth}>
            ›
          </button>
        </div>
      </div>

      {halves.map((halfDays, hi) => {
        const leftW = TYPE_W + ROOM_W + CAP_W + halfDays.length * DATE_COL;

        return (
          <div key={hi} className={styles.halfBlock}>
            {/* ── 일정 현황 ── */}
            <div className={styles.tableWrap}>
              <div className={styles.sectionTitle}>일정 현황</div>
              <div style={{ minWidth: leftW, width: "100%" }}>
                <table
                  className={styles.table}
                  style={{ minWidth: leftW, width: "100%" }}
                >
                  <colgroup>
                    <col style={{ width: `${TYPE_W}px` }} />
                    <col style={{ width: `${ROOM_W}px` }} />
                    <col style={{ width: `${CAP_W}px` }} />
                    {halfDays.map((cal) => (
                      <col
                        key={cal.dateStr}
                        style={{ width: `${DATE_COL}px` }}
                      />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.thType}>구분</th>
                      <th className={styles.thRoom}>호실</th>
                      <th className={styles.thCap}>정원</th>
                      {halfDays.map((cal) => (
                        <th key={cal.dateStr} className={thCls(cal)}>
                          <div>{cal.date.getDate()}일</div>
                          <div className={styles.dayLabel}>
                            {WEEK_DAYS[cal.date.getDay()]}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CLASSROOM_GROUPS.map((group, gi) =>
                      group.rooms.map((room, ri) => (
                        <tr key={`${gi}-${ri}`}>
                          {ri === 0 && (
                            <td
                              className={`${styles.tdType} ${styles[group.bg]}`}
                              rowSpan={group.rooms.length}
                            >
                              {group.type}
                            </td>
                          )}
                          <td
                            className={`${styles.tdRoom} ${styles[group.bg]}`}
                          >
                            {room.id}
                          </td>
                          <td className={`${styles.tdCap} ${styles[group.bg]}`}>
                            {room.cap ?? ""}
                          </td>

                          {group.type === "숙박"
                            ? halfDays.map((cal) => {
                                const count = getRoomCount(
                                  cal.dateStr,
                                  room.id,
                                );
                                return (
                                  <td key={cal.dateStr} className={tdCls(cal)}>
                                    {count > 0 && (
                                      <span className={styles.roomCount}>
                                        {count}
                                      </span>
                                    )}
                                  </td>
                                );
                              })
                            : group.type === "운동장"
                              ? halfDays.map((cal) => (
                                  <td
                                    key={cal.dateStr}
                                    className={tdCls(cal)}
                                  />
                                ))
                              : halfDays.map((cal) => {
                                  const res = getClassroomRes(
                                    room.id,
                                    cal.dateStr,
                                  );
                                  return (
                                    <td
                                      key={cal.dateStr}
                                      className={tdCls(cal)}
                                    >
                                      {res && (
                                        <ReservationTooltip reservation={res}>
                                          <span
                                            className={styles.bar}
                                            style={{
                                              backgroundColor: res.colorCode,
                                              cursor: "pointer",
                                            }}
                                            onClick={() => setEditTarget(res)}
                                          >
                                            {res.organization.slice(0, 5)}
                                          </span>
                                        </ReservationTooltip>
                                      )}
                                    </td>
                                  );
                                })}
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {editTarget && (
        <ReservationModal
          reservation={editTarget}
          allReservations={reservations}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
