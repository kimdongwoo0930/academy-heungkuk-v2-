import { TodayClassroomItem } from '@/types/dashboard';
import styles from './TodaySchedule.module.css';

const DOT_COLORS = ['#e8306a', '#2563eb', '#0eab6e', '#f97316', '#7c3aed'];

interface Props {
  todayClassrooms: TodayClassroomItem[];
}

export default function TodaySchedule({ todayClassrooms }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>오늘 일정</span>
        <span className={styles.count}>{todayClassrooms.length}건</span>
      </div>
      <div className={styles.list}>
        {todayClassrooms.length === 0 && (
          <div className={styles.empty}>오늘 예정된 강의실 일정이 없습니다.</div>
        )}
        {todayClassrooms.map((s, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.dot} style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
            <div className={styles.info}>
              <div className={styles.org}>{s.organization}</div>
              <div className={styles.room}>{s.classroom}호 · {s.purpose} · {s.people}명</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
