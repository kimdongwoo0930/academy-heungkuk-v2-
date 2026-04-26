'use client';

import { MonthlyItem } from '@/types/dashboard';
import styles from './MonthlyChart.module.css';

const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const Y_STEPS = [0, 5, 10, 15, 20];

interface Props {
  monthlyData: MonthlyItem[];
  year: number;
  currentMonth: number;
}

export default function MonthlyChart({ monthlyData, year, currentMonth }: Props) {
  const actualMax = Math.max(...monthlyData.map((d) => d.count), 0);
  // 최대값이 20을 넘으면 5 단위로 올림해서 스케일 확장
  const max = actualMax > 20
    ? Math.ceil(actualMax / 5) * 5
    : 20;

  const yLabels = max === 20 ? Y_STEPS : [0, max / 4, max / 2, (max * 3) / 4, max].map(Math.round);

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>월별 이용 업체 추이</span>
        <span className={styles.sub}>{year}년 기준</span>
      </div>

      <div className={styles.chartWrap}>
        {/* Y축 레이블 */}
        <div className={styles.yAxis}>
          {[...yLabels].reverse().map((v) => (
            <span key={v} className={styles.yLabel}>{v}</span>
          ))}
        </div>

        {/* 차트 영역 */}
        <div className={styles.chartArea}>
          {/* 그리드 라인 */}
          <div className={styles.gridLines}>
            {yLabels.map((v) => (
              <div
                key={v}
                className={`${styles.gridLine} ${v === 0 ? styles.gridLineBase : ''}`}
                style={{ bottom: `${(v / max) * 100}%` }}
              />
            ))}
          </div>

          {/* 막대 */}
          <div className={styles.bars}>
            {monthlyData.map((d) => {
              const pct = d.count ? (d.count / max) * 100 : 0;
              const isCurrent = d.month === currentMonth;
              const isFuture = d.month > currentMonth;
              return (
                <div key={d.month} className={styles.col}>
                  <div className={styles.barWrap}>
                    {d.count > 0 && (
                      <div className={styles.barValAbove}>{d.count}</div>
                    )}
                    <div
                      className={`${styles.bar} ${isCurrent ? styles.barCurrent : isFuture ? styles.barFuture : styles.barData}`}
                      style={{ height: `${pct}%` }}
                      title={`${MONTH_LABELS[d.month - 1]}: ${d.count}개 업체`}
                    />
                  </div>
                  <div className={`${styles.label} ${isCurrent ? styles.labelCurrent : ''}`}>
                    {MONTH_LABELS[d.month - 1]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
