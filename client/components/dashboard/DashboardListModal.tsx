import { Reservation } from "@/types/reservation";
import styles from "./DashboardListModal.module.css";

interface Props {
  title: string;
  items: Reservation[];
  onSelect: (r: Reservation) => void;
  onClose: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  확정: "#0eab6e",
  대기: "#f97316",
  취소: "#e8306a",
};

const formatDate = (date: string) => {
  const [, month, day] = date.split("-");
  return `${Number(month)}.${Number(day)}`;
};

const getDurationDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / dayMs) + 1);
};

export default function DashboardListModal({
  title,
  items,
  onSelect,
  onClose,
}: Props) {
  const organizationCount = new Set(items.map((item) => item.organization))
    .size;
  const totalPeople = items.reduce((sum, item) => sum + item.people, 0);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div>
            <span className={styles.eyebrow}>예약 목록</span>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>이용 업체</span>
            <strong>{organizationCount}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>이용 인원</span>
            <strong>{totalPeople.toLocaleString()}명</strong>
          </div>
        </div>

        <div className={styles.list}>
          {items.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📋</span>
              <strong>해당 기간 예약이 없습니다.</strong>
              <span>다른 기간의 예약 현황을 확인해 주세요.</span>
            </div>
          )}
          {items.map((r) => (
            <button
              key={r.id}
              className={styles.item}
              onClick={() => onSelect(r)}
            >
              <div
                className={styles.accent}
                style={{ background: r.colorCode ?? "#ccc" }}
              />
              <div className={styles.info}>
                <div className={styles.itemTop}>
                  <span className={styles.org}>{r.organization}</span>
                  <span
                    className={styles.status}
                    style={{
                      color: STATUS_COLOR[r.status] ?? "var(--neutral)",
                      backgroundColor: `${STATUS_COLOR[r.status] ?? "#999"}18`,
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <div className={styles.metaGrid}>
                  <span>
                    {formatDate(r.startDate)} - {formatDate(r.endDate)}
                  </span>
                  <span>{getDurationDays(r.startDate, r.endDate)}일</span>
                  <span>{r.people.toLocaleString()}명</span>
                </div>
                {r.purpose && <div className={styles.purpose}>{r.purpose}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
