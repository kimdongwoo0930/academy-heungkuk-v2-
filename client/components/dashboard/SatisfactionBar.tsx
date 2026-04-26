import { SatisfactionData } from '@/types/dashboard';
import styles from './SatisfactionBar.module.css';

const SAT_ITEMS = [
  { key: 'staffService' as const, label: '직원 서비스', colorFrom: '#0eab6e', colorTo: '#2dd4bf' },
  { key: 'cleanliness'  as const, label: '청결 상태',   colorFrom: '#0eab6e', colorTo: '#2dd4bf' },
  { key: 'cafeteria'    as const, label: '식당',        colorFrom: '#2563eb', colorTo: '#7c3aed' },
  { key: 'pricing'      as const, label: '이용 비용',   colorFrom: '#2563eb', colorTo: '#7c3aed' },
  { key: 'facilities'   as const, label: '시설',        colorFrom: '#f97316', colorTo: '#d97706' },
];

interface Props {
  satisfaction: SatisfactionData;
}

export default function SatisfactionBar({ satisfaction }: Props) {
  const count = satisfaction.totalCount;
  const scores = SAT_ITEMS.map((i) => satisfaction[i.key]);
  const overall = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <span className={styles.title}>설문 만족도 현황</span>
          <span className={styles.sub}>누적 {count}건</span>
        </div>
        <div className={styles.overallBadge}>
          <span className={styles.overallScore}>{overall.toFixed(1)}</span>
          <span className={styles.overallMax}> / 5.0</span>
        </div>
      </div>

      <div className={styles.bars}>
        {SAT_ITEMS.map((item) => {
          const score = satisfaction[item.key];
          const width = score ? (score / 5) * 100 : 0;
          return (
            <div key={item.key} className={styles.row}>
              <div className={styles.label}>{item.label}</div>
              <div className={styles.trackWrap}>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${item.colorFrom}, ${item.colorTo})`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.scoreBox}>
                <span className={styles.score}>{score.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.scoreCards}>
        {SAT_ITEMS.map((item) => {
          const score = satisfaction[item.key];
          return (
            <div key={item.key} className={styles.scoreCard}>
              <div
                className={styles.scoreCardVal}
                style={{ color: item.colorFrom }}
              >
                {score.toFixed(1)}
              </div>
              <div className={styles.scoreCardLabel}>{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
