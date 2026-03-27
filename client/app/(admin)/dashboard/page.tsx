'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/types/reservation';
import { getReservations } from '@/lib/api/reservation';
import styles from './page.module.css';

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getReservations()
      .then(setReservations)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const totalThisMonth = reservations.filter((r) =>
    r.startDate.startsWith(new Date().toISOString().slice(0, 7))
  ).length;

  const confirmed = reservations.filter((r) => r.status === '확정').length;
  const pending = reservations.filter((r) => r.status === '예약').length;

  const todayPeople = reservations
    .filter((r) => r.status !== '취소' && r.startDate <= today && r.endDate >= today)
    .reduce((sum, r) => sum + r.people, 0);

  const upcoming = reservations
    .filter((r) => r.status !== '취소' && r.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  const recent = [...reservations]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  if (isLoading) return (
    <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-sub)', fontSize: 14 }}>
      데이터를 가져오는 중...
    </div>
  );

  return (
    <div>
      {/* 통계 카드 */}
      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.cardAccent}`}>
          <p className={styles.cardLabel}>이번 달 예약</p>
          <p className={styles.cardValue}>
            {totalThisMonth}
            <span className={styles.cardUnit}>건</span>
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>확정 예약</p>
          <p className={styles.cardValue}>
            {confirmed}
            <span className={styles.cardUnit}>건</span>
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>대기 중</p>
          <p className={styles.cardValue}>
            {pending}
            <span className={styles.cardUnit}>건</span>
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>오늘 현원</p>
          <p className={styles.cardValue}>
            {todayPeople}
            <span className={styles.cardUnit}>명</span>
          </p>
        </div>
      </div>

      <div className={styles.section}>
        {/* 다가오는 예약 */}
        <div className={styles.panel}>
          <p className={styles.panelTitle}>다가오는 예약</p>
          {upcoming.length === 0 ? (
            <p style={{ color: 'var(--text-sub)', fontSize: 13 }}>예정된 예약이 없습니다.</p>
          ) : (
            upcoming.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <span className={styles.orgName}>
                  <span className={styles.dot} style={{ backgroundColor: r.colorCode }} />
                  {r.organization}
                </span>
                <span className={styles.date}>{r.startDate} ~ {r.endDate}</span>
                <span className={`${styles.badge} ${styles[r.status]}`}>{r.status}</span>
              </div>
            ))
          )}
        </div>

        {/* 최근 등록 */}
        <div className={styles.panel}>
          <p className={styles.panelTitle}>최근 등록된 예약</p>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-sub)', fontSize: 13 }}>등록된 예약이 없습니다.</p>
          ) : (
            recent.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <span className={styles.orgName}>
                  <span className={styles.dot} style={{ backgroundColor: r.colorCode }} />
                  {r.organization}
                </span>
                <span className={styles.date}>{r.people}명</span>
                <span className={`${styles.badge} ${styles[r.status]}`}>{r.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
