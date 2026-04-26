import { SatisfactionData } from '@/types/dashboard';
import styles from './SatisfactionBar.module.css';

const SAT_ITEMS = [
  { key: 'staffService' as const, label: '직원 서비스', colorFrom: '#0eab6e', colorTo: '#2dd4bf' },
  { key: 'cleanliness'  as const, label: '청결 상태',   colorFrom: '#0eab6e', colorTo: '#2dd4bf' },
  { key: 'cafeteria'    as const, label: '식당',        colorFrom: '#2563eb', colorTo: '#7c3aed' },
  { key: 'pricing'      as const, label: '이용 비용',   colorFrom: '#2563eb', colorTo: '#7c3aed' },
  { key: 'facilities'   as const, label: '시설',        colorFrom: '#d97706', colorTo: '#f97316' },
];

interface Props {
  satisfaction: SatisfactionData;
}

export default function SatisfactionBar({ satisfaction }: Props) {
  const count = satisfaction.totalCount;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>설문 만족도 현황</span>
        <span className={styles.sub}>누적 {count}건</span>
      </div>
      <div className={styles.bars}>
        {SAT_ITEMS.map((item) => {
          const score = satisfaction[item.key];
          const width = score ? (score / 5) * 100 : 0;
          return (
            <div key={item.key} className={styles.row}>
              <div className={styles.label}>{item.label}</div>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${item.colorFrom}, ${item.colorTo})`,
                  }}
                />
              </div>
              <div className={styles.score}>{score.toFixed(1)}</div>
              <div className={styles.count}>{count}건</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
