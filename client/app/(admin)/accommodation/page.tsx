"use client";

import ReservationModal from "@/components/reservation/ReservationModal";
import { getReservations, toRequestBody, updateReservation } from "@/lib/api/reservation";
import { Reservation, RoomReservation } from "@/types/reservation";
import { isHoliday } from "@hyunbinseo/holidays-kr";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const STATUS_COLOR: Record<string, string> = {
  확정: "#16a34a",
  예약: "#d97706",
  취소: "#dc2626",
};

function checkIsHoliday(date: Date): boolean {
  try { return isHoliday(date); } catch { return false; }
}

function makeDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface CalDay {
  date: Date;
  dateStr: string;
  isCurrent: boolean;
}

interface TooltipState {
  res: Reservation;
  rooms: RoomReservation[];
  x: number;
  y: number;
}

const ORG_COL = 80;
const DATE_COL = 56;
const TOTAL_COL = 44;

export default function AccommodationPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch(() => alert("예약 데이터를 불러오는데 실패했습니다."));
  }, []);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);
  const endOffset = (7 - lastDay.getDay()) % 7;
  const endDate = new Date(year, month + 1, endOffset);

  const calDays: CalDay[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const d = new Date(cur);
    calDays.push({ date: d, dateStr: makeDateStr(d), isCurrent: d.getMonth() === month });
    cur.setDate(cur.getDate() + 1);
  }

  const halves: CalDay[][] = [];
  for (let i = 0; i < calDays.length; i += 7) halves.push(calDays.slice(i, i + 7));

  const displayedDates = new Set(calDays.map((c) => c.dateStr));

  const activeRoomReservations = reservations.filter((r) => {
    if (r.status === "취소") return false;
    return r.rooms?.some((rm) => displayedDates.has(String(rm.reservedDate)));
  });

  const getRoomsOnDate = (resId: number, dateStr: string) => {
    const res = reservations.find((r) => r.id === resId);
    return res?.rooms?.filter((rm) => String(rm.reservedDate) === dateStr) ?? [];
  };

  const getDayTotal = (dateStr: string) => {
    let total = 0;
    activeRoomReservations.forEach((r) => {
      total += getRoomsOnDate(r.id, dateStr).length;
    });
    return total;
  };

  const isRedDay = (_dateStr: string, date: Date) =>
    date.getDay() === 0 || date.getDay() === 6 || checkIsHoliday(date);

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
    if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1);
  };

  const handleSave = async (data: Reservation) => {
    try {
      const body = toRequestBody(data);
      const updated = await updateReservation(data.id, body);
      setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditTarget(null);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      alert(status === 403 ? "수정 권한이 없습니다." : "저장 중 오류가 발생했습니다.");
    }
  };

  const handleMouseMove = (e: React.MouseEvent, res: Reservation, rooms: string[]) => {
    const tooltipW = 220;
    const tooltipH = 140;
    const x = e.clientX + 14 + tooltipW > window.innerWidth ? e.clientX - tooltipW - 8 : e.clientX + 14;
    const y = e.clientY + 14 + tooltipH > window.innerHeight ? e.clientY - tooltipH - 8 : e.clientY + 14;
    setTooltip({ res, rooms, x, y });
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>숙박 현황</h2>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <span className={styles.monthLabel}>{year}년 {month + 1}월</span>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
        </div>
      </div>

      {halves.map((halfDays, hi) => {
        const tableW = ORG_COL + halfDays.length * DATE_COL + TOTAL_COL;
        const halfActiveRes = activeRoomReservations.filter((res) =>
          halfDays.some((cal) => getRoomsOnDate(res.id, cal.dateStr).length > 0)
        );

        return (
          <div key={hi} className={styles.halfBlock}>
            <div className={styles.tableWrap}>
              <div style={{ minWidth: tableW, width: "100%" }}>
                <table className={styles.table} style={{ minWidth: tableW, width: "100%" }}>
                  <colgroup>
                    <col style={{ width: `${ORG_COL}px` }} />
                    {halfDays.map((cal) => (
                      <col key={cal.dateStr} style={{ width: `${DATE_COL}px` }} />
                    ))}
                    <col style={{ width: `${TOTAL_COL}px` }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.thOrg}>단체명</th>
                      {halfDays.map((cal) => (
                        <th key={cal.dateStr} className={thCls(cal)}>
                          <div>{cal.date.getDate()}일</div>
                          <div className={styles.dayLabel}>{WEEK_DAYS[cal.date.getDay()]}</div>
                        </th>
                      ))}
                      <th className={styles.thTotal}>합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {halfActiveRes.length === 0 ? (
                      <tr>
                        <td colSpan={1 + halfDays.length + 1} className={styles.emptyCell}>
                          이번 달 숙박 예약이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      halfActiveRes.map((res) => {
                        const halfTotal = halfDays.reduce(
                          (sum, cal) => sum + getRoomsOnDate(res.id, cal.dateStr).length, 0
                        );
                        const cls = res.status === "확정" ? styles.confirmed : styles.pending;
                        return (
                          <tr key={res.id}>
                            <td
                              className={styles.tdOrg}
                              style={{ borderLeft: `4px solid ${res.colorCode}`, cursor: "pointer" }}
                              onClick={() => setEditTarget(res)}
                            >
                              {res.organization}
                            </td>
                            {halfDays.map((cal) => {
                              const rooms = getRoomsOnDate(res.id, cal.dateStr);
                              const count = rooms.length;
                              return (
                                <td
                                  key={cal.dateStr}
                                  className={`${styles.roomCell} ${tdCls(cal)}`}
                                  onMouseEnter={(e) => count > 0 && handleMouseMove(e, res, rooms)}
                                  onMouseMove={(e) => count > 0 && handleMouseMove(e, res, rooms)}
                                  onMouseLeave={() => setTooltip(null)}
                                >
                                  {count > 0 && (
                                    <div className={styles.typeBreakdown}>
                                      {(['4인실', '2인실', '1인실'] as const).map((type) => {
                                        const c = rooms.filter((r) => r.roomType === type).length;
                                        return c > 0 ? (
                                          <div key={type} className={styles.typeLine}>
                                            <span className={styles.typeLabel}>{type.replace('인실', '인')}</span>
                                            <span className={cls}>{c}</span>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className={styles.weekTotalCell}>
                              {halfTotal > 0 ? halfTotal : ""}
                            </td>
                          </tr>
                        );
                      })
                    )}
                    {halfActiveRes.length > 0 && (() => {
                      const grandTotal = halfDays.reduce((s, cal) => s + getDayTotal(cal.dateStr), 0);
                      return (
                        <tr key="total" className={styles.totalRow}>
                          <td className={styles.totalLabel}>합계</td>
                          {halfDays.map((cal) => {
                            const cnt = getDayTotal(cal.dateStr);
                            return (
                              <td key={cal.dateStr} className={tdCls(cal)}>
                                {cnt > 0 ? cnt : ""}
                              </td>
                            );
                          })}
                          <td className={styles.weekTotalCell}>
                            {grandTotal > 0 ? grandTotal : ""}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* 월 총합 */}
      {(() => {
        const monthDates = calDays.filter((c) => c.isCurrent);
        const monthTotal = monthDates.reduce((s, c) => s + getDayTotal(c.dateStr), 0);
        const firstDate = monthDates[0]?.dateStr ?? "";
        const lastDate = monthDates[monthDates.length - 1]?.dateStr ?? "";
        return (
          <div className={styles.monthSummary}>
            <span className={styles.monthSummaryTitle}>
              {year}년 {month + 1}월 총합
              <span className={styles.monthSummaryRange}>( {firstDate} ~ {lastDate} )</span>
            </span>
            <div className={styles.monthSummaryItems}>
              <span className={styles.monthSummaryTotal}>
                총 숙박 객실 수 <strong>{monthTotal}</strong>
              </span>
            </div>
          </div>
        );
      })()}

      {/* 호버 툴팁 */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipOrg}>{tooltip.res.organization}</span>
            <span className={styles.tooltipBadge} style={{ color: STATUS_COLOR[tooltip.res.status] ?? "#555" }}>
              {tooltip.res.status}
            </span>
          </div>
          <div className={styles.tooltipDivider} />
          <div className={styles.tooltipInfo}>
            <span className={styles.tooltipKey}>기간</span>
            <span>{tooltip.res.startDate} ~ {tooltip.res.endDate}</span>
          </div>
          <div className={styles.tooltipInfo}>
            <span className={styles.tooltipKey}>인원</span>
            <span>{tooltip.res.people}인</span>
            {tooltip.res.purpose && (
              <><span className={styles.tooltipSep}>·</span><span>{tooltip.res.purpose}</span></>
            )}
          </div>
          <div className={styles.tooltipInfo}>
            <span className={styles.tooltipKey}>담당</span>
            <span>{tooltip.res.customer}</span>
            <span className={styles.tooltipSep}>·</span>
            <span>{tooltip.res.customerPhone}</span>
          </div>
          {(['4인실', '2인실', '1인실'] as const).map((type) => {
            const typeRooms = tooltip.rooms.filter((r) => r.roomType === type);
            return typeRooms.length > 0 ? (
              <div key={type} className={styles.tooltipInfo}>
                <span className={styles.tooltipKey}>{type}</span>
                <span>{typeRooms.map((r) => r.roomNumber + '호').join(', ')}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

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
