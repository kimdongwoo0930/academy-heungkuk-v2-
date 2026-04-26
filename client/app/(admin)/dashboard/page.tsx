'use client';

import { useEffect, useState } from 'react';
import KpiCard from '@/components/dashboard/KpiCard';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import RecentSurveyTable from '@/components/dashboard/RecentSurveyTable';
import RoomStatus from '@/components/dashboard/RoomStatus';
import SatisfactionBar from '@/components/dashboard/SatisfactionBar';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import { getDashboard } from '@/lib/api/dashboard';
import { DashboardData } from '@/types/dashboard';
import styles from './page.module.css';

export default function DashboardPage() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHead}>
          <span className={styles.pageTitle}>대시보드</span>
          <div className={styles.dateBadge}>
            오늘 <span>{dateStr}</span>
          </div>
        </div>
        <div className={styles.loading}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  const { kpi, todayClassrooms, monthlyData, satisfaction, recentSurveys } = data;
  const change = kpi.monthlyChange;

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <span className={styles.pageTitle}>대시보드</span>
        <div className={styles.dateBadge}>
          오늘 <span>{dateStr}</span>
        </div>
      </div>

      {/* KPI 카드 3개 */}
      <div className={styles.kpiGrid}>
        <KpiCard
          label="이번 달 이용 업체"
          value={kpi.monthlyReservations}
          icon="📋"
          variant="pink"
          animDelay="0.05s"
          subText={
            <>
              전월 대비{' '}
              <span className={change >= 0 ? styles.up : styles.down}>
                {change >= 0 ? `↑ +${change}건` : `↓ ${change}건`}
              </span>
            </>
          }
        />
        <KpiCard
          label="오늘 입실"
          value={kpi.todayCheckIn}
          icon="🏨"
          variant="green"
          animDelay="0.10s"
          subText={
            <>
              총 <span className={styles.greenText}>{kpi.todayPeople}명</span> 이용 예정
            </>
          }
        />
        <KpiCard
          label="설문 만족도"
          value={kpi.surveyScore}
          icon="⭐"
          variant="yellow"
          animDelay="0.15s"
          subText={<>{kpi.surveyCount}건 응답 평균</>}
        />
      </div>

      {/* 오늘 일정(1fr) + 월별 추이(2fr) */}
      <div className={styles.row3}>
        <TodaySchedule todayClassrooms={todayClassrooms} />
        <MonthlyChart
          monthlyData={monthlyData}
          year={today.getFullYear()}
          currentMonth={today.getMonth() + 1}
        />
      </div>

      {/* 강의실 현황 + 설문 만족도 */}
      <div className={styles.row2}>
        <RoomStatus todayClassrooms={todayClassrooms} />
        <SatisfactionBar satisfaction={satisfaction} />
      </div>

      {/* 최근 설문 내역 */}
      <RecentSurveyTable recentSurveys={recentSurveys} />
    </div>
  );
}
