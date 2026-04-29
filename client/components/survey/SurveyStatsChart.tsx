'use client';

import { SurveyResult } from '@/types/survey';
import styles from './SurveyStatsChart.module.css';

interface Props {
  surveys: SurveyResult[];
}

type ScoreKey = 'staffService' | 'cleanliness' | 'facilities' | 'cafeteria' | 'pricing';

const CATEGORIES: { key: ScoreKey; label: string }[] = [
  { key: 'staffService', label: '직원서비스' },
  { key: 'cleanliness', label: '청결' },
  { key: 'facilities', label: '시설' },
  { key: 'cafeteria', label: '식당' },
  { key: 'pricing', label: '비용' },
];

// SurveyCard와 동일: score 1=매우불만족 ~ 5=매우만족 (높을수록 좋음)
const COLORS      = ['#dc2626', '#e8306a', '#d97706', '#2563eb', '#0eab6e'];
const SCORE_LABELS = ['매우불만족', '불만족', '보통', '만족', '매우만족'];

const R = 36;
const CIRC = 2 * Math.PI * R;

function getCounts(surveys: SurveyResult[], key: ScoreKey): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const s of surveys) {
    const v = s[key];
    if (v >= 1 && v <= 5) counts[v - 1]++;
  }
  return counts;
}

function getDistribution(surveys: SurveyResult[], key: ScoreKey): number[] {
  const total = surveys.length;
  if (total === 0) return [0, 0, 0, 0, 0];
  return getCounts(surveys, key).map((c) => Math.round((c / total) * 1000) / 10);
}

function getAverage(surveys: SurveyResult[], key: ScoreKey): string {
  if (surveys.length === 0) return '-';
  const sum = surveys.reduce((a, s) => a + (s[key] || 0), 0);
  return (sum / surveys.length).toFixed(1);
}

// 높을수록 좋음: 5=매우만족(green) ~ 1=매우불만족(red)
function avgColor(avg: string): string {
  const n = parseFloat(avg);
  if (isNaN(n)) return '#a89fc0';
  if (n >= 4.5) return '#0eab6e'; // 매우만족
  if (n >= 3.5) return '#2563eb'; // 만족
  if (n >= 2.5) return '#d97706'; // 보통
  if (n >= 1.5) return '#e8306a'; // 불만족
  return '#dc2626';               // 매우불만족
}

function DonutChart({ dist }: { dist: number[] }) {
  let accumulated = 0;
  const hasData = dist.some((v) => v > 0);

  return (
    <svg viewBox="0 0 100 100" className={styles.svg}>
      <circle cx={50} cy={50} r={R} fill="none" strokeWidth={13} className={styles.ringBg} />
      {hasData &&
        dist.map((p, i) => {
          if (p === 0) return null;
          const len = (p / 100) * CIRC;
          const offset = CIRC - accumulated;
          accumulated += len;
          return (
            <circle
              key={i}
              cx={50}
              cy={50}
              r={R}
              fill="none"
              stroke={COLORS[i]}
              strokeWidth={13}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${CIRC - len}`}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
        })}
    </svg>
  );
}

export default function SurveyStatsChart({ surveys }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>만족도 통계</span>
        <span className={styles.sectionCount}>총 {surveys.length}건 응답</span>
      </div>
      <div className={styles.row}>
        {CATEGORIES.map(({ key, label }) => {
          const dist = getDistribution(surveys, key);
          const counts = getCounts(surveys, key);
          const avg = getAverage(surveys, key);
          const color = avgColor(avg);
          return (
            <div key={key} className={styles.card}>
              <div className={styles.cardLabel}>{label}</div>
              <div className={styles.chartBox}>
                <DonutChart dist={dist} />
                <div className={styles.centerText}>
                  <div className={styles.avgNum} style={{ color }}>
                    {avg}
                  </div>
                  <div className={styles.avgSub}>평균</div>
                </div>
              </div>
              <ul className={styles.legend}>
                {SCORE_LABELS.map((l, i) => (
                  <li key={i} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: COLORS[i] }} />
                    <span className={styles.legendLabel}>{l}</span>
                    <span className={styles.legendPct}>{counts[i]}건</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
