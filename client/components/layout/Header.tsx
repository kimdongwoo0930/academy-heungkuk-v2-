'use client';

import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const PAGE_TITLES: Record<string, string> = {
  '/reservation': '예약 관리',
  '/scheduler': '일정 현황',
  '/load': '설문 관리',
  '/restaurant': '식수 관리',
  '/accommodation': '숙박 현황',
  '/document': '문서 관리',
  '/settings': '설정',
};

interface Props {
  collapsed: boolean;
}

export default function Header({ collapsed }: Props) {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? '';

  return (
    <>
      <header className={`${styles.header} ${collapsed ? styles.headerCollapsed : ''}`}>
        <span className={styles.title}>{title}</span>
      </header>

    </>
  );
}
