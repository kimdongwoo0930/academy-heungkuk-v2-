'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/types/reservation';
import { getReservations, updateReservation, toRequestBody } from '@/lib/api/reservation';
import ReservationModal from '@/components/reservation/ReservationModal';
import styles from './page.module.css';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const HOLIDAYS = new Set([
  '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30',
  '2025-03-01', '2025-05-05', '2025-05-06', '2025-06-06',
  '2025-08-15', '2025-10-03', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-09', '2025-12-25',
  '2026-01-01', '2026-02-17', '2026-02-18', '2026-02-19',
  '2026-03-01', '2026-05-05', '2026-05-24', '2026-06-06',
  '2026-08-15', '2026-09-24', '2026-09-25', '2026-09-26',
  '2026-10-03', '2026-10-09', '2026-12-25',
]);

const ORG_COL  = 90;
const DATE_COL = 20; // 조/중/석 서브컬럼 하나당 너비
const TOTAL_COL = 44;

function makeDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface CalDay {
  date: Date;
  dateStr: string;
  isCurrent: boolean;
}

export default function RestaurantPage() {
  const today = new Date();

  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editTarget, setEditTarget]     = useState<Reservation | null>(null);

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch(() => alert('예약 데이터를 불러오는데 실패했습니다.'));
  }, []);

  // ── 달력 그리드 생성 ──
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const lastDate       = new Date(year, month + 1, 0).getDate();
  const lastDayOfWeek  = new Date(year, month + 1, 0).getDay();

  const calDays: CalDay[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    calDays.push({ date: d, dateStr: makeDateStr(d), isCurrent: false });
  }
  for (let i = 1; i <= lastDate; i++) {
    const d = new Date(year, month, i);
    calDays.push({ date: d, dateStr: makeDateStr(d), isCurrent: true });
  }
  const trailing = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek;
  for (let i = 1; i <= trailing; i++) {
    const d = new Date(year, month + 1, i);
    calDays.push({ date: d, dateStr: makeDateStr(d), isCurrent: false });
  }

  const half1 = Math.ceil(calDays.length / 2);
  const halves: CalDay[][] = [
    calDays.slice(0, half1),
    calDays.slice(half1),
  ].filter(h => h.length > 0);

  const isRedDay = (dateStr: string, date: Date) =>
    date.getDay() === 0 || date.getDay() === 6 || HOLIDAYS.has(dateStr);

  const thCls = (cal: CalDay) => {
    if (!cal.isCurrent)                  return styles.otherMonthTh;
    if (isRedDay(cal.dateStr, cal.date)) return styles.weekendTh;
    return '';
  };

  const tdCls = (cal: CalDay) => {
    if (!cal.isCurrent)                  return styles.otherMonthCol;
    if (isRedDay(cal.dateStr, cal.date)) return styles.weekendCol;
    return '';
  };

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const handleSave = async (data: Reservation) => {
    try {
      const body    = toRequestBody(data);
      const updated = await updateReservation(data.id, body);
      setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditTarget(null);
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const displayedDates = new Set(calDays.map(c => c.dateStr));

  const activeMealReservations = reservations.filter(r => {
    if (r.status === '취소') return false;
    return r.meals?.some(m => displayedDates.has(String(m.reservedDate)));
  });

  const getOrgMeal = (resId: number, dateStr: string) => {
    const res = reservations.find(r => r.id === resId);
    return res?.meals?.find(m => String(m.reservedDate) === dateStr) ?? null;
  };

  const getDayTotal = (dateStr: string, type: 'breakfast' | 'lunch' | 'dinner') => {
    let total = 0;
    activeMealReservations.forEach(r => {
      const meal = getOrgMeal(r.id, dateStr);
      if (meal) total += meal[type];
    });
    return total;
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>식당 관리</h2>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <span className={styles.monthLabel}>{year}년 {month + 1}월</span>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
        </div>
      </div>

      {halves.map((halfDays, hi) => {
        const tableW = ORG_COL + halfDays.length * DATE_COL * 3 + TOTAL_COL;
        const halfActiveMealRes = activeMealReservations.filter(res =>
          halfDays.some(cal => {
            const meal = getOrgMeal(res.id, cal.dateStr);
            return meal && (meal.breakfast > 0 || meal.lunch > 0 || meal.dinner > 0);
          })
        );

        return (
          <div key={hi} className={styles.halfBlock}>
            <div className={styles.tableWrap}>
              <div style={{ minWidth: tableW, width: '100%' }}>
                <table className={styles.table} style={{ minWidth: tableW, width: '100%' }}>
                  <colgroup>
                    <col style={{ width: `${ORG_COL}px` }} />
                    {halfDays.flatMap(cal => [
                      <col key={`${cal.dateStr}b`} style={{ width: `${DATE_COL}px` }} />,
                      <col key={`${cal.dateStr}l`} style={{ width: `${DATE_COL}px` }} />,
                      <col key={`${cal.dateStr}d`} style={{ width: `${DATE_COL}px` }} />,
                    ])}
                    <col style={{ width: `${TOTAL_COL}px` }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th rowSpan={2} className={styles.thOrg}>단체명</th>
                      {halfDays.map(cal => (
                        <th key={cal.dateStr} colSpan={3} className={thCls(cal)}>
                          <div>{cal.date.getDate()}일</div>
                          <div className={styles.dayLabel}>{WEEK_DAYS[cal.date.getDay()]}</div>
                        </th>
                      ))}
                      <th rowSpan={2} className={styles.thTotal}>식수계</th>
                    </tr>
                    <tr>
                      {halfDays.flatMap(cal => [
                        <th key={`${cal.dateStr}b`} className={`${styles.mealSubTh} ${thCls(cal)}`}>조</th>,
                        <th key={`${cal.dateStr}l`} className={`${styles.mealSubTh} ${thCls(cal)}`}>중</th>,
                        <th key={`${cal.dateStr}d`} className={`${styles.mealSubTh} ${thCls(cal)}`}>석</th>,
                      ])}
                    </tr>
                  </thead>
                  <tbody>
                    {halfActiveMealRes.length === 0 ? (
                      <tr>
                        <td colSpan={1 + halfDays.length * 3 + 1} className={styles.emptyCell}>
                          이번 달 식수 예약이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      halfActiveMealRes.map(res => {
                        const halfTotal = halfDays.reduce((sum, cal) => {
                          const meal = getOrgMeal(res.id, cal.dateStr);
                          return sum + (meal ? meal.breakfast + meal.lunch + meal.dinner : 0);
                        }, 0);
                        const cls = res.status === '확정' ? styles.confirmed : styles.pending;
                        return (
                          <tr key={res.id}>
                            <td
                              className={styles.tdOrg}
                              style={{ borderLeft: `4px solid ${res.colorCode}`, cursor: 'pointer' }}
                              onClick={() => setEditTarget(res)}
                            >
                              {res.organization}
                            </td>
                            {halfDays.flatMap(cal => {
                              const meal = getOrgMeal(res.id, cal.dateStr);
                              const b  = meal?.breakfast ?? 0;
                              const l  = meal?.lunch     ?? 0;
                              const dn = meal?.dinner    ?? 0;
                              return [
                                <td key={`${cal.dateStr}b`} className={`${styles.mealCell} ${tdCls(cal)} ${b  > 0 ? cls : ''}`}>{b  > 0 ? b  : ''}</td>,
                                <td key={`${cal.dateStr}l`} className={`${styles.mealCell} ${tdCls(cal)} ${l  > 0 ? cls : ''}`}>{l  > 0 ? l  : ''}</td>,
                                <td key={`${cal.dateStr}d`} className={`${styles.mealCell} ${tdCls(cal)} ${dn > 0 ? cls : ''}`}>{dn > 0 ? dn : ''}</td>,
                              ];
                            })}
                            <td className={styles.weekTotalCell}>{halfTotal > 0 ? halfTotal : ''}</td>
                          </tr>
                        );
                      })
                    )}
                    {halfActiveMealRes.length > 0 && (() => {
                      const grandTotal = halfDays.reduce((s, cal) =>
                        s + getDayTotal(cal.dateStr, 'breakfast') + getDayTotal(cal.dateStr, 'lunch') + getDayTotal(cal.dateStr, 'dinner'), 0);
                      return (
                        <tr key="total" className={styles.totalRow}>
                          <td className={styles.totalLabel}>합계</td>
                          {halfDays.flatMap(cal => {
                            const b  = getDayTotal(cal.dateStr, 'breakfast');
                            const l  = getDayTotal(cal.dateStr, 'lunch');
                            const dn = getDayTotal(cal.dateStr, 'dinner');
                            return [
                              <td key={`${cal.dateStr}b`} className={tdCls(cal)}>{b  > 0 ? b  : ''}</td>,
                              <td key={`${cal.dateStr}l`} className={tdCls(cal)}>{l  > 0 ? l  : ''}</td>,
                              <td key={`${cal.dateStr}d`} className={tdCls(cal)}>{dn > 0 ? dn : ''}</td>,
                            ];
                          })}
                          <td className={styles.weekTotalCell}>{grandTotal > 0 ? grandTotal : ''}</td>
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
