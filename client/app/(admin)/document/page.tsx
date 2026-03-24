'use client';

import styles from './page.module.css';

export default function DocumentPage() {
  return (
    <div className={styles.comingSoon}>
      <div className={styles.comingSoonIcon}>📄</div>
      <h2 className={styles.comingSoonTitle}>문서 관리</h2>
      <p className={styles.comingSoonDesc}>견적서·확인서·거래명세서 기능은 준비 중입니다.</p>
    </div>
  );
}
