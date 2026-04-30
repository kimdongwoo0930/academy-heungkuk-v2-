'use client';

import { useEffect, useState } from 'react';
import { TodayClassroomItem } from '@/types/dashboard';
import { CLASSROOM_LIST } from '@/lib/constants/classrooms';
import { isAdmin } from '@/lib/utils/auth';
import styles from './RoomStatus.module.css';

interface Props {
  todayClassrooms: TodayClassroomItem[];
  disabledClassrooms?: string[];
  onItemClick?: (reservationId: number) => void;
}

export default function RoomStatus({ todayClassrooms, disabledClassrooms = [], onItemClick }: Props) {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  const occupiedMap = new Map(
    todayClassrooms.map((c) => [c.classroom, { org: c.organization, id: c.reservationId }])
  );
  const disabledSet = new Set(disabledClassrooms);
  const occupiedCount = CLASSROOM_LIST.filter((r) => occupiedMap.has(r.code)).length;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>오늘 강의실 현황</span>
        <span className={styles.sub}>사용 중 {occupiedCount} / 전체 {CLASSROOM_LIST.length}</span>
      </div>
      <div className={styles.grid}>
        {CLASSROOM_LIST.map((room) => {
          const occupied = occupiedMap.get(room.code);
          const isDisabled = disabledSet.has(room.code);
          const clickable = !!occupied && !isDisabled && admin && !!onItemClick;

          let stateClass = styles.available;
          if (isDisabled) stateClass = styles.disabled;
          else if (occupied) stateClass = styles.occupied;

          return (
            <div
              key={room.code}
              className={`${styles.item} ${stateClass} ${clickable ? styles.clickable : ''}`}
              onClick={() => clickable && onItemClick!(occupied!.id)}
            >
              <div className={styles.name}>{room.name}</div>
              <div className={styles.cap}>{room.capacity}인</div>
              <div className={styles.status}>
                ● {isDisabled ? '사용불가' : occupied ? '사용 중' : '사용 가능'}
              </div>
              <div className={styles.org}>{occupied && !isDisabled ? occupied.org : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
