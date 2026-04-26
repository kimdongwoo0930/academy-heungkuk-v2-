'use client';

import { MonthlyItem } from '@/types/dashboard';
import styles from './MonthlyChart.module.css';

const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

interface Props {
  monthlyData: MonthlyItem[];
  year: number;
  currentMonth: number;
}

export default function MonthlyChart({ monthlyData, year, currentMonth }: Props) {
  const max = Math.max(...monthlyData.map((d) => d.count), 1);

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>월별 이용 업체 추이</span>
        <span className={styles.sub}>{year}년 기준</span>
      </div>
      <div className={styles.chart}>
        {monthlyData.map((d) => {
          const pct = d.count ? (d.count / max) * 100 : 4;
          const isCurrent = d.month === currentMonth;
          const barClass = isCurrent ? styles.barCurrent : d.count ? styles.barData : styles.barEmpty;
          return (
            <div key={d.month} className={styles.col}>
              <div className={styles.barWrap}>
                <div
                  className={`${styles.bar} ${barClass}`}
                  style={{ height: `${pct}%` }}
                  title={`${MONTH_LABELS[d.month - 1]}: ${d.count}건`}
                />
              </div>
              <div className={styles.label}>{MONTH_LABELS[d.month - 1]}</div>
              <div className={d.count ? styles.val : styles.valHidden}>{d.count || 0}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
