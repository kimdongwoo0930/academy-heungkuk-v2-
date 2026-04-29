import { Reservation } from '@/types/reservation';
import styles from './DashboardListModal.module.css';

interface Props {
  title: string;
  items: Reservation[];
  onSelect: (r: Reservation) => void;
  onClose: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  '확정': '#0eab6e',
  '대기': '#f97316',
  '취소': '#e8306a',
};

export default function DashboardListModal({ title, items, onSelect, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <span className={styles.title}>{title}</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>
        <div className={styles.list}>
          {items.length === 0 && (
            <div className={styles.empty}>해당 기간 예약이 없습니다.</div>
          )}
          {items.map((r) => (
            <div key={r.id} className={styles.item} onClick={() => onSelect(r)}>
              <div
                className={styles.colorDot}
                style={{ background: r.colorCode ?? '#ccc' }}
              />
              <div className={styles.info}>
                <div className={styles.org}>{r.organization}</div>
                <div className={styles.meta}>
                  {r.startDate} ~ {r.endDate} · {r.people}명
                </div>
              </div>
              <span
                className={styles.status}
                style={{ color: STATUS_COLOR[r.status] ?? '#999' }}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
