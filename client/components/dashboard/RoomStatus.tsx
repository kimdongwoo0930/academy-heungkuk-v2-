'use client';

import { useEffect, useState } from 'react';
import { TodayClassroomItem } from '@/types/dashboard';
import { isAdmin } from '@/lib/utils/auth';
import styles from './RoomStatus.module.css';

const STATIC_ROOMS = [
  { code: '101', name: '소강의실 101호', capacity: 30 },
  { code: '102', name: '소강의실 102호', capacity: 20 },
  { code: '103', name: '소강의실 103호', capacity: 30 },
  { code: '105', name: '대강의실 105호', capacity: 120 },
  { code: '106', name: '분임실 106호',   capacity: 12 },
  { code: '107', name: '분임실 107호',   capacity: 12 },
  { code: '201', name: '중강의실 201호', capacity: 70 },
  { code: '202', name: '소강의실 202호', capacity: 30 },
  { code: '203', name: '중강의실 203호', capacity: 50 },
  { code: '204', name: '중강의실 204호', capacity: 50 },
  { code: '205', name: '분임실 205호',   capacity: 12 },
  { code: '206', name: '분임실 206호',   capacity: 12 },
  { code: 'A',   name: '다목적실 A',     capacity: 80 },
  { code: 'B',   name: '다목적실 B',     capacity: 40 },
];

interface Props {
  todayClassrooms: TodayClassroomItem[];
  onItemClick?: (reservationId: number) => void;
}

export default function RoomStatus({ todayClassrooms, onItemClick }: Props) {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  const occupiedMap = new Map(
    todayClassrooms.map((c) => [c.classroom, { org: c.organization, id: c.reservationId }])
  );
  const occupiedCount = STATIC_ROOMS.filter((r) => occupiedMap.has(r.code)).length;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>오늘 강의실 현황</span>
        <span className={styles.sub}>사용 중 {occupiedCount} / 전체 {STATIC_ROOMS.length}</span>
      </div>
      <div className={styles.grid}>
        {STATIC_ROOMS.map((room) => {
          const occupied = occupiedMap.get(room.code);
          const clickable = !!occupied && admin && !!onItemClick;
          return (
            <div
              key={room.code}
              className={`${styles.item} ${occupied ? styles.occupied : styles.available} ${clickable ? styles.clickable : ''}`}
              onClick={() => clickable && onItemClick!(occupied!.id)}
            >
              <div className={styles.name}>{room.name}</div>
              <div className={styles.cap}>{room.capacity}인</div>
              <div className={styles.status}>● {occupied ? '사용 중' : '사용 가능'}</div>
              {occupied && <div className={styles.org}>{occupied.org}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
