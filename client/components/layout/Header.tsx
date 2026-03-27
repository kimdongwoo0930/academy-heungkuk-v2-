'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { updateMyPassword } from '@/lib/api/account';
import { parseJwtPayload } from '@/lib/utils/auth';
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

function getTokenInfo(): { userId: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = parseJwtPayload(token);
    return { userId: (payload.sub as string) ?? '', role: (payload.role as string) ?? '' };
  } catch {
    return null;
  }
}

interface Props {
  collapsed: boolean;
}

export default function Header({ collapsed }: Props) {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? '';

  const tokenInfo = getTokenInfo();
  const userId = tokenInfo?.userId ?? '사용자';
  const isAdmin = tokenInfo?.role === 'ROLE_ADMIN';
  const avatarChar = userId.charAt(0).toUpperCase();

  const [showPwModal, setShowPwModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyPassword(newPassword);
      setShowPwModal(false);
      setNewPassword('');
    } catch {
      alert('비밀번호 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className={`${styles.header} ${collapsed ? styles.headerCollapsed : ''}`}>
        <button className={styles.user} onClick={() => setShowPwModal(true)}>
          <div className={styles.avatar}>{avatarChar}</div>
          <span>{userId}</span>
          {isAdmin && <span className={styles.adminBadge}>관리자</span>}
        </button>
      </header>

      {showPwModal && (
        <div className={styles.overlay} onClick={() => setShowPwModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>비밀번호 변경</span>
              <button className={styles.closeBtn} onClick={() => setShowPwModal(false)}>✕</button>
            </div>
            <form className={styles.modalBody} onSubmit={handlePasswordChange}>
              <label className={styles.fieldLabel}>
                새 비밀번호
                <input
                  className={styles.fieldInput}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 입력"
                  required
                  minLength={4}
                  autoFocus
                />
              </label>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowPwModal(false)}>
                  취소
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? '변경 중...' : '변경'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
