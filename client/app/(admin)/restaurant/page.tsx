"use client";

import ReservationModal from "@/components/reservation/ReservationModal";
import {
  getReservations,
  toRequestBody,
  updateReservation,
} from "@/lib/api/reservation";
import { Reservation } from "@/types/reservation";
import { isHoliday } from "@hyunbinseo/holidays-kr";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function checkIsHoliday(date: Date): boolean {
  try {
    return isHoliday(date);
  } catch {
    return false;
  }
}

const ORG_COL = 72;
const DATE_COL = 16; // 조/중/석 서브컬럼 하나당 너비
const TOTAL_COL = 36;

function makeDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface CalDay {
  date: Date;
  dateStr: string;
  isCurrent: boolean;
}

export default function RestaurantPage() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch(() => alert("예약 데이터를 불러오는데 실패했습니다."));
  }, []);

  // ── 주 단위 그리드 생성 (월요일 시작, 7일씩) ──
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 월요일 기준 시작일 (Mon=1 → offset 0, Sun=0 → offset 6)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  // 일요일 기준 종료일
  const endOffset = (7 - lastDay.getDay()) % 7;
  const endDate = new Date(year, month + 1, endOffset);

  const calDays: CalDay[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const d = new Date(cur);
    calDays.push({
      date: d,
      dateStr: makeDateStr(d),
      isCurrent: d.getMonth() === month,
    });
    cur.setDate(cur.getDate() + 1);
  }

  const halves: CalDay[][] = [];
  for (let i = 0; i < calDays.length; i += 7) {
    halves.push(calDays.slice(i, i + 7));
  }

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
      const updated = await updateReservation(data.id, body);
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      setEditTarget(null);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      alert(status === 403 ? "수정 권한이 없습니다." : "저장 중 오류가 발생했습니다.");
    }
  };

  const displayedDates = new Set(calDays.map((c) => c.dateStr));

  const activeMealReservations = reservations.filter((r) => {
    if (r.status === "취소") return false;
    return r.meals?.some((m) => displayedDates.has(String(m.reservedDate)));
  });

  const getOrgMeal = (resId: number, dateStr: string) => {
    const res = reservations.find((r) => r.id === resId);
    return res?.meals?.find((m) => String(m.reservedDate) === dateStr) ?? null;
  };

  const getDayTotal = (
    dateStr: string,
    type: "breakfast" | "lunch" | "dinner",
  ) => {
    let total = 0;
    activeMealReservations.forEach((r) => {
      const meal = getOrgMeal(r.id, dateStr);
      if (meal) total += meal[type];
    });
    return total;
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>식수 현황</h2>
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
        const tableW = ORG_COL + halfDays.length * DATE_COL * 3 + TOTAL_COL;
        const halfActiveMealRes = activeMealReservations.filter((res) =>
          halfDays.some((cal) => {
            const meal = getOrgMeal(res.id, cal.dateStr);
            return (
              meal && (meal.breakfast > 0 || meal.lunch > 0 || meal.dinner > 0)
            );
          }),
        );

        return (
          <div key={hi} className={styles.halfBlock}>
            <div className={styles.tableWrap}>
              <div style={{ minWidth: tableW, width: "100%" }}>
                <table
                  className={styles.table}
                  style={{ minWidth: tableW, width: "100%" }}
                >
                  <colgroup>
                    <col style={{ width: `${ORG_COL}px` }} />
                    {halfDays.flatMap((cal) => [
                      <col
                        key={`${cal.dateStr}b`}
                        style={{ width: `${DATE_COL}px` }}
                      />,
                      <col
                        key={`${cal.dateStr}l`}
                        style={{ width: `${DATE_COL}px` }}
                      />,
                      <col
                        key={`${cal.dateStr}d`}
                        style={{ width: `${DATE_COL}px` }}
                      />,
                    ])}
                    <col style={{ width: `${TOTAL_COL}px` }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th rowSpan={2} className={styles.thOrg}>
                        단체명
                      </th>
                      {halfDays.map((cal) => (
                        <th
                          key={cal.dateStr}
                          colSpan={3}
                          className={thCls(cal)}
                        >
                          <div className={styles.dateNum}>{cal.date.getDate()}일</div>
                          <div className={styles.dayLabel}>
                            {WEEK_DAYS[cal.date.getDay()]}
                          </div>
                        </th>
                      ))}
                      <th rowSpan={2} className={styles.thTotal}>
                        식수계
                      </th>
                    </tr>
                    <tr>
                      {halfDays.flatMap((cal) => [
                        <th
                          key={`${cal.dateStr}b`}
                          className={`${styles.mealSubTh} ${thCls(cal)}`}
                        >
                          조
                        </th>,
                        <th
                          key={`${cal.dateStr}l`}
                          className={`${styles.mealSubTh} ${thCls(cal)}`}
                        >
                          중
                        </th>,
                        <th
                          key={`${cal.dateStr}d`}
                          className={`${styles.mealSubTh} ${thCls(cal)}`}
                        >
                          석
                        </th>,
                      ])}
                    </tr>
                  </thead>
                  <tbody>
                    {halfActiveMealRes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={1 + halfDays.length * 3 + 1}
                          className={styles.emptyCell}
                        >
                          이번 달 식수 예약이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      halfActiveMealRes.map((res) => {
                        const halfTotal = halfDays.reduce((sum, cal) => {
                          const meal = getOrgMeal(res.id, cal.dateStr);
                          return (
                            sum +
                            (meal
                              ? meal.breakfast + meal.lunch + meal.dinner
                              : 0)
                          );
                        }, 0);
                        const cls =
                          res.status === "확정"
                            ? styles.confirmed
                            : styles.pending;
                        return (
                          <tr key={res.id}>
                            <td
                              className={styles.tdOrg}
                              style={{
                                borderLeft: `4px solid ${res.colorCode}`,
                                cursor: "pointer",
                              }}
                              onClick={() => setEditTarget(res)}
                            >
                              {res.organization}
                            </td>
                            {halfDays.flatMap((cal) => {
                              const meal = getOrgMeal(res.id, cal.dateStr);
                              const b = meal?.breakfast ?? 0;
                              const l = meal?.lunch ?? 0;
                              const dn = meal?.dinner ?? 0;
                              const sb = meal?.specialBreakfast ?? false;
                              const sl = meal?.specialLunch ?? false;
                              const sd = meal?.specialDinner ?? false;
                              const renderMeal = (count: number, isSpecial: boolean) => {
                                if (count === 0) return "";
                                if (isSpecial) {
                                  const specialCls = res.status === "확정" ? styles.specialMealConfirmed : styles.specialMeal;
                                  return <span className={specialCls}>{count}</span>;
                                }
                                return <span className={cls}>{count}</span>;
                              };
                              return [
                                <td key={`${cal.dateStr}b`} className={`${styles.mealCell} ${tdCls(cal)}`}>
                                  {renderMeal(b, sb)}
                                </td>,
                                <td key={`${cal.dateStr}l`} className={`${styles.mealCell} ${tdCls(cal)}`}>
                                  {renderMeal(l, sl)}
                                </td>,
                                <td key={`${cal.dateStr}d`} className={`${styles.mealCell} ${tdCls(cal)}`}>
                                  {renderMeal(dn, sd)}
                                </td>,
                              ];
                            })}
                            <td className={styles.weekTotalCell}>
                              {halfTotal > 0 ? halfTotal : ""}
                            </td>
                          </tr>
                        );
                      })
                    )}
                    {halfActiveMealRes.length > 0 &&
                      (() => {
                        const grandTotal = halfDays.reduce(
                          (s, cal) =>
                            s +
                            getDayTotal(cal.dateStr, "breakfast") +
                            getDayTotal(cal.dateStr, "lunch") +
                            getDayTotal(cal.dateStr, "dinner"),
                          0,
                        );
                        return (
                          <tr key="total" className={styles.totalRow}>
                            <td className={styles.totalLabel}>합계</td>
                            {halfDays.flatMap((cal) => {
                              const b = getDayTotal(cal.dateStr, "breakfast");
                              const l = getDayTotal(cal.dateStr, "lunch");
                              const dn = getDayTotal(cal.dateStr, "dinner");
                              return [
                                <td
                                  key={`${cal.dateStr}b`}
                                  className={tdCls(cal)}
                                >
                                  {b > 0 ? b : ""}
                                </td>,
                                <td
                                  key={`${cal.dateStr}l`}
                                  className={tdCls(cal)}
                                >
                                  {l > 0 ? l : ""}
                                </td>,
                                <td
                                  key={`${cal.dateStr}d`}
                                  className={tdCls(cal)}
                                >
                                  {dn > 0 ? dn : ""}
                                </td>,
                              ];
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
        const monthB = monthDates.reduce(
          (s, c) => s + getDayTotal(c.dateStr, "breakfast"),
          0,
        );
        const monthL = monthDates.reduce(
          (s, c) => s + getDayTotal(c.dateStr, "lunch"),
          0,
        );
        const monthD = monthDates.reduce(
          (s, c) => s + getDayTotal(c.dateStr, "dinner"),
          0,
        );
        const monthTotal = monthB + monthL + monthD;
        const firstDate = monthDates[0]?.dateStr ?? "";
        const lastDate = monthDates[monthDates.length - 1]?.dateStr ?? "";
        return (
          <div className={styles.monthSummary}>
            <span className={styles.monthSummaryTitle}>
              {year}년 {month + 1}월 총합
              <span className={styles.monthSummaryRange}>
                ( {firstDate} ~ {lastDate} )
              </span>
            </span>
            <div className={styles.monthSummaryItems}>
              <span>
                조식 <strong>{monthB}</strong>
              </span>
              <span>
                중식 <strong>{monthL}</strong>
              </span>
              <span>
                석식 <strong>{monthD}</strong>
              </span>
              <span className={styles.monthSummaryTotal}>
                합계 <strong>{monthTotal}</strong>
              </span>
            </div>
          </div>
        );
      })()}

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
