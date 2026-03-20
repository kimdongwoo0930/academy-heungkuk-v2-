'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/types/reservation';
import { getReservations, updateReservation, toRequestBody } from '@/lib/api/reservation';
import ReservationTooltip from '@/components/scheduler/ReservationTooltip';
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

const CLASSROOM_GROUPS = [
  { type: '대강의실', bg: 'bgYellow', rooms: [{ id: '105', cap: 120 }] },
  { type: '중강의실', bg: 'bgYellow', rooms: [{ id: '201', cap: 70 }, { id: '203', cap: 50 }, { id: '204', cap: 50 }] },
  { type: '소강의실', bg: 'bgYellow', rooms: [{ id: '202', cap: 30 }, { id: '103', cap: 30 }, { id: '102', cap: 20 }] },
  { type: '분임실',   bg: 'bgGreen',  rooms: [{ id: '106', cap: 12 }, { id: '205', cap: 12 }, { id: '206', cap: 12 }] },
  { type: '다목적실', bg: 'bgBlue',   rooms: [{ id: 'A', cap: 80 }, { id: 'B', cap: 40 }] },
  { type: '운동장',   bg: 'bgOrange', rooms: [{ id: '-', cap: null }] },
  { type: '숙박',     bg: 'bgWhite',  rooms: [{ id: '1인실', cap: null }, { id: '2인실', cap: null }, { id: '4인실', cap: null }] },
  { type: '소강의실', bg: 'bgGray',   rooms: [{ id: '101', cap: 30 }] },
  { type: '분임실',   bg: 'bgGray',   rooms: [{ id: '107', cap: 12 }] },
];

const TYPE_W   = 38;
const ROOM_W   = 28;
const CAP_W    = 20;
const DATE_COL = 36;
const SUB_COL  = 20;

function makeDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface CalDay {
  date: Date;
  dateStr: string;
  isCurrent: boolean; // 이번 달 여부
}

export default function SchedulerPage() {
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

  // ── 달력 그리드 생성 (일요일 시작) ──
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=일
  const lastDate       = new Date(year, month + 1, 0).getDate();
  const lastDayOfWeek  = new Date(year, month + 1, 0).getDay(); // 마지막 날 요일

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
  ].filter(h => h.length > 0);

  // ── 스타일 헬퍼 ──
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

  // ── 데이터 조회 ──
  const getClassroomRes = (roomId: string, dateStr: string) =>
    reservations.find(r => r.status !== '취소' &&
      r.classrooms?.some(c => c.classroomName === roomId && String(c.reservedDate) === dateStr));

  const getRoomCount = (dateStr: string, type: string) => {
    let count = 0;
    reservations.forEach(r => {
      if (r.status !== '취소')
        r.rooms?.forEach(rm => { if (String(rm.reservedDate) === dateStr && rm.roomType === type) count++; });
    });
    return count;
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
        <h2 className={styles.title}>일정 현황</h2>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <span className={styles.monthLabel}>{year}년 {month + 1}월</span>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
        </div>
      </div>

      {halves.map((halfDays, hi) => {
        const leftW  = TYPE_W + ROOM_W + CAP_W + halfDays.length * DATE_COL;
        const rightW = 80 + halfDays.length * SUB_COL * 3 + 40;

        return (
          <div key={hi} className={styles.halfBlock}>

            {/* ── 일정 현황 ── */}
            <div className={styles.tableWrap}>
              <div className={styles.sectionTitle}>일정 현황</div>
              <div style={{ minWidth: leftW, width: '100%' }}>
                <table className={styles.table} style={{ minWidth: leftW, width: '100%' }}>
                  <colgroup>
                    <col style={{ width: `${TYPE_W}px` }} />
                    <col style={{ width: `${ROOM_W}px` }} />
                    <col style={{ width: `${CAP_W}px` }} />
                    {halfDays.map(cal => <col key={cal.dateStr} style={{ width: `${DATE_COL}px` }} />)}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.thType}>구분</th>
                      <th className={styles.thRoom}>호실</th>
                      <th className={styles.thCap}>정원</th>
                      {halfDays.map(cal => (
                        <th key={cal.dateStr} className={thCls(cal)}>
                          <div>{cal.date.getDate()}일</div>
                          <div className={styles.dayLabel}>{WEEK_DAYS[cal.date.getDay()]}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CLASSROOM_GROUPS.map((group, gi) =>
                      group.rooms.map((room, ri) => (
                        <tr key={`${gi}-${ri}`}>
                          {ri === 0 && (
                            <td className={`${styles.tdType} ${styles[group.bg]}`} rowSpan={group.rooms.length}>
                              {group.type}
                            </td>
                          )}
                          <td className={`${styles.tdRoom} ${styles[group.bg]}`}>{room.id}</td>
                          <td className={`${styles.tdCap} ${styles[group.bg]}`}>{room.cap ?? ''}</td>

                          {group.type === '숙박'
                            ? halfDays.map(cal => {
                                const count = getRoomCount(cal.dateStr, room.id);
                                return (
                                  <td key={cal.dateStr} className={tdCls(cal)}>
                                    {count > 0 && <span className={styles.roomCount}>{count}</span>}
                                  </td>
                                );
                              })
                            : group.type === '운동장'
                            ? halfDays.map(cal => <td key={cal.dateStr} className={tdCls(cal)} />)
                            : halfDays.map(cal => {
                                const res = getClassroomRes(room.id, cal.dateStr);
                                return (
                                  <td key={cal.dateStr} className={tdCls(cal)}>
                                    {res && (
                                      <ReservationTooltip reservation={res}>
                                        <span
                                          className={styles.bar}
                                          style={{ backgroundColor: res.colorCode, cursor: 'pointer' }}
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
                      ))
                    )}
                    <tr className={styles.totalRow}>
                      <td colSpan={3} className={styles.totalLabel}>식수 계</td>
                      {halfDays.map(cal => {
                        const t = getDayTotal(cal.dateStr, 'breakfast') + getDayTotal(cal.dateStr, 'lunch') + getDayTotal(cal.dateStr, 'dinner');
                        return <td key={cal.dateStr} className={tdCls(cal)}>{t > 0 ? t : '-'}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 식수 현황 (비활성화) ── */}
            {false && <div className={styles.tableWrap}>
              <div className={styles.sectionTitle}>식수 현황</div>
              <div style={{ minWidth: rightW, width: '100%' }}>
                <table className={styles.table} style={{ minWidth: rightW, width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '80px' }} />
                    {halfDays.flatMap(cal => [
                      <col key={`${cal.dateStr}b`} style={{ width: `${SUB_COL}px` }} />,
                      <col key={`${cal.dateStr}l`} style={{ width: `${SUB_COL}px` }} />,
                      <col key={`${cal.dateStr}d`} style={{ width: `${SUB_COL}px` }} />,
                    ])}
                    <col style={{ width: '40px' }} />
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
                    {activeMealReservations.length === 0 ? (
                      <tr>
                        <td colSpan={1 + halfDays.length * 3 + 1} className={styles.emptyCell}>
                          이번 달 식수 예약이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      activeMealReservations.map(res => {
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
                              <ReservationTooltip reservation={res}>
                                <span>{res.organization}</span>
                              </ReservationTooltip>
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
                    {activeMealReservations.length > 0 && (() => {
                      const grandTotal = halfDays.reduce((s, cal) =>
                        s + getDayTotal(cal.dateStr, 'breakfast') + getDayTotal(cal.dateStr, 'lunch') + getDayTotal(cal.dateStr, 'dinner'), 0);
                      return (
                        <tr className={styles.totalRow}>
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
            </div>}

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
