'use client';

import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/reservation': '예약 관리',
  '/scheduler': '일정 현황',
  '/load': '부하 현황',
  '/restaurant': '식당 관리',
  '/document': '문서 관리',
  '/settings': '설정',
};

export default function Header() {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? '';

  return (
    <header className={styles.header}>
      <span className={styles.title}>{title}</span>
      <div className={styles.user}>
        <div className={styles.avatar}>관</div>
        <span>관리자</span>
      </div>
    </header>
  );
}
