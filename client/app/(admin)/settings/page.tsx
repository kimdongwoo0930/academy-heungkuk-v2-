'use client';

import { useState, useEffect } from 'react';
import { AccountInfo, getAccounts, updateAccountRole, deleteAccount } from '@/lib/api/account';
import styles from './page.module.css';

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState<string | null>(() => getCurrentUserId());

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => alert('계정 목록을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleRole = async (acc: AccountInfo) => {
    const newRole = acc.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    try {
      await updateAccountRole(acc.id, newRole);
      setAccounts((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, role: newRole, state: newRole === 'ROLE_ADMIN' ? true : a.state } : a))
      );
    } catch {
      alert('권한 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number, userId: string) => {
    if (!confirm(`'${userId}' 계정을 삭제하시겠습니까?`)) return;
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('계정 삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2 className={styles.title}>계정 관리</h2>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>아이디</th>
              <th>이름</th>
              <th>권한</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.empty}>불러오는 중...</td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>계정이 없습니다.</td>
              </tr>
            ) : (
              accounts.map((acc) => {
                const isSelf = acc.userId === currentUserId;
                return (
                <tr key={acc.id}>
                  <td className={styles.userId}>{acc.userId}</td>
                  <td>{acc.username}</td>
                  <td>
                    <button
                      className={`${styles.roleBtn} ${acc.role === 'ROLE_ADMIN' ? styles.admin : styles.user}`}
                      onClick={() => handleToggleRole(acc)}
                      disabled={isSelf}
                    >
                      {acc.role === 'ROLE_ADMIN' ? '관리자' : '일반'}
                    </button>
                  </td>
                  <td className={styles.date}>{acc.createdAt?.slice(0, 10)}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(acc.id, acc.userId)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
