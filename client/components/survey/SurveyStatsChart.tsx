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

const COLORS = ['#e8306a', '#4c7cf7', '#f5c842', '#8b6fcf', '#c9c4d6'];
const SCORE_LABELS = ['매우만족', '만족', '보통', '불만족', '매우불만족'];

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

function avgColor(avg: string): string {
  const n = parseFloat(avg);
  if (isNaN(n)) return '#a89fc0';
  if (n <= 1.8) return '#e8306a';
  if (n <= 2.5) return '#4c7cf7';
  if (n <= 3.5) return '#f5a623';
  return '#8b6fcf';
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
