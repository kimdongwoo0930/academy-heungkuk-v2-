'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AccountInfo, getAccounts, updateAccountRole, deleteAccount, createAccount, updateAccountPassword } from '@/lib/api/account';
import { getSettings, saveSettings } from '@/lib/api/settings';
import { exportReservations, importReservations, ImportResult } from '@/lib/api/reservation';
import { isAdmin, parseJwtPayload } from '@/lib/utils/auth';
import { CLASSROOM_CATEGORIES } from '@/lib/constants/classrooms';
import {
  AppSettings,
  getDefaultAppSettings,
  parseSettings,
  serializeSettings,
  setCachedSettings,
} from '@/lib/utils/priceSettings';
import styles from './page.module.css';

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = parseJwtPayload(token);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

interface CreateForm {
  userId: string;
  username: string;
  password: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState<string | null>(() => getCurrentUserId());
  const [admin] = useState<boolean>(() => isAdmin());

  useEffect(() => {
    if (!isAdmin()) router.replace('/scheduler');
  }, [router]);

  // ── 설정 state ──
  const [appSettings, setAppSettings] = useState<AppSettings>(() => getDefaultAppSettings());
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    getSettings()
      .then((raw) => {
        const parsed = parseSettings(raw);
        setAppSettings(parsed);
        setCachedSettings(parsed);
      })
      .catch(() => {/* 서버 미설정 시 기본값 사용 */});
  }, []);

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    try {
      const flat = serializeSettings(appSettings);
      await saveSettings(flat);
      setCachedSettings(appSettings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch {
      alert('수정 권한이 없습니다.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const setPrice = (key: string, value: number) => {
    if (key in appSettings.prices.classrooms) {
      setAppSettings((s) => ({
        ...s,
        prices: { ...s.prices, classrooms: { ...s.prices.classrooms, [key]: value } },
      }));
    } else {
      setAppSettings((s) => ({ ...s, prices: { ...s.prices, [key]: value } }));
    }
  };

  const setContact = (key: keyof AppSettings['contact'], value: string) => {
    setAppSettings((s) => ({ ...s, contact: { ...s.contact, [key]: value } }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReservations();
    } catch {
      alert('내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // input 초기화 — 같은 파일을 다시 선택해도 onChange 발생하도록
    e.target.value = '';
    if (!confirm(`'${file.name}' 파일로 예약 데이터를 가져옵니다.\n기존 예약은 덮어씌워집니다. 계속하시겠습니까?`)) return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importReservations(file);
      setImportResult(result);
    } catch {
      alert('가져오기에 실패했습니다.');
    } finally {
      setImporting(false);
    }
  };

  // ── 계정 관리 ──
  const [pwTarget, setPwTarget] = useState<AccountInfo | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwChanging, setPwChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pwTarget) return;
    setPwChanging(true);
    try {
      await updateAccountPassword(pwTarget.id, newPassword);
      setPwTarget(null);
      setNewPassword('');
    } catch {
      alert('비밀번호 변경에 실패했습니다.');
    } finally {
      setPwChanging(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>({ userId: '', username: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => alert('계정 목록을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleRole = async (acc: AccountInfo) => {
    if (!admin) return;
    const newRole = acc.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    try {
      await updateAccountRole(acc.id, newRole);
      setAccounts((prev) => prev.map((a) => (a.id === acc.id ? { ...a, role: newRole } : a)));
    } catch {
      alert('권한 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number, userId: string) => {
    if (!admin) return;
    if (!confirm(`'${userId}' 계정을 삭제하시겠습니까?`)) return;
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('계정 삭제에 실패했습니다.');
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const created = await createAccount(form);
      setAccounts((prev) => [...prev, created]);
      setShowModal(false);
      setForm({ userId: '', username: '', password: '' });
    } catch {
      setFormError('이미 사용 중인 아이디이거나 오류가 발생했습니다.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* 계정 관리 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>계정 관리</h2>
          {admin && (
            <button className={styles.addBtn} onClick={() => setShowModal(true)}>
              + 멤버 추가
            </button>
          )}
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>권한</th>
                <th>등록일</th>
                {admin && <th>관리</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={admin ? 5 : 4} className={styles.empty}>불러오는 중...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={admin ? 5 : 4} className={styles.empty}>계정이 없습니다.</td></tr>
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
                          disabled={!admin || isSelf}
                        >
                          {acc.role === 'ROLE_ADMIN' ? '관리자' : '일반'}
                        </button>
                      </td>
                      <td className={styles.date}>{acc.createdAt?.slice(0, 10)}</td>
                      {admin && (
                        <td className={styles.actionCell}>
                          <button
                            className={styles.pwBtn}
                            onClick={() => { setPwTarget(acc); setNewPassword(''); }}
                          >
                            비밀번호
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(acc.id, acc.userId)}
                            disabled={isSelf}
                          >
                            삭제
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 요금 / 담당자 설정 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>요금 / 담당자 설정</h2>
          <button className={styles.addBtn} onClick={handleSettingsSave} disabled={settingsSaving}>
            {settingsSaved ? '저장됨 ✓' : settingsSaving ? '저장 중...' : '저장'}
          </button>
        </div>

        <div className={styles.priceGrid}>
          {/* 강의실 요금 */}
          <div className={styles.priceBlock}>
            <h3 className={styles.priceBlockTitle}>강의실 요금 (원/일)</h3>
            {CLASSROOM_CATEGORIES.map((cat) => (
              <label key={cat} className={styles.priceRow}>
                <span className={styles.priceLabel}>{cat}</span>
                <input
                  className={styles.priceInput}
                  type="number"
                  value={appSettings.prices.classrooms[cat]}
                  onChange={(e) => setPrice(cat, Number(e.target.value))}
                />
              </label>
            ))}
          </div>

          {/* 숙박 / 식비 */}
          <div className={styles.priceBlock}>
            <h3 className={styles.priceBlockTitle}>숙박 / 식비 (원/건)</h3>
            <label className={styles.priceRow}>
              <span className={styles.priceLabel}>숙박비</span>
              <input
                className={styles.priceInput}
                type="number"
                value={appSettings.prices.roomPrice}
                onChange={(e) => setPrice('roomPrice', Number(e.target.value))}
              />
            </label>
            <label className={styles.priceRow}>
              <span className={styles.priceLabel}>식비 (일반)</span>
              <input
                className={styles.priceInput}
                type="number"
                value={appSettings.prices.mealPrice}
                onChange={(e) => setPrice('mealPrice', Number(e.target.value))}
              />
            </label>
            <label className={styles.priceRow}>
              <span className={styles.priceLabel}>식비 (특식)</span>
              <input
                className={styles.priceInput}
                type="number"
                value={appSettings.prices.specialMealPrice}
                onChange={(e) => setPrice('specialMealPrice', Number(e.target.value))}
              />
            </label>
          </div>

          {/* 담당자 / 대표이사 */}
          <div className={styles.priceBlock}>
            <h3 className={styles.priceBlockTitle}>담당자 / 대표이사</h3>
            {(
              [
                { key: 'representative', label: '대표이사' },
                { key: 'manager', label: '담당자' },
                { key: 'phone', label: '전화번호' },
                { key: 'fax', label: '팩스번호' },
                { key: 'email', label: '이메일' },
              ] as { key: keyof AppSettings['contact']; label: string }[]
            ).map(({ key, label }) => (
              <label key={key} className={styles.priceRow}>
                <span className={styles.priceLabel}>{label}</span>
                <input
                  className={styles.priceInput}
                  type="text"
                  value={appSettings.contact[key]}
                  onChange={(e) => setContact(key, e.target.value)}
                  style={{ width: 160 }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 데이터 백업 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>데이터 백업</h2>
        </div>
        <div className={styles.backupBlock}>
          <div className={styles.backupRow}>
            <div>
              <p className={styles.backupLabel}>예약 데이터 내보내기</p>
              <p className={styles.backupDesc}>모든 예약 정보를 xlsx 파일로 다운로드합니다.</p>
            </div>
            <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
              {exporting ? '다운로드 중...' : 'xlsx 내보내기'}
            </button>
          </div>
          <div className={styles.backupDivider} />
          <div className={styles.backupRow}>
            <div>
              <p className={styles.backupLabel}>예약 데이터 가져오기</p>
              <p className={styles.backupDesc}>내보내기한 xlsx 파일로 데이터를 복원합니다. 예약 코드 기준으로 덮어씁니다.</p>
              {importResult && (
                <p className={styles.importResult}>
                  완료 — 신규 {importResult.created}건 / 수정 {importResult.updated}건
                  {importResult.failed > 0 && ` / 실패 ${importResult.failed}건`}
                </p>
              )}
            </div>
            <label className={`${styles.importBtn} ${importing ? styles.importing : ''}`}>
              {importing ? '가져오는 중...' : 'xlsx 가져오기'}
              <input
                type="file"
                accept=".xlsx"
                onChange={handleImport}
                disabled={importing}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      {pwTarget && (
        <div className={styles.overlay} onClick={() => setPwTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{pwTarget.username} 비밀번호 변경</span>
              <button className={styles.closeBtn} onClick={() => setPwTarget(null)}>✕</button>
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
                <button type="button" className={styles.cancelBtn} onClick={() => setPwTarget(null)}>
                  취소
                </button>
                <button type="submit" className={styles.saveBtn} disabled={pwChanging}>
                  {pwChanging ? '변경 중...' : '변경'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>멤버 추가</span>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className={styles.modalBody} onSubmit={handleCreate}>
              <label className={styles.fieldLabel}>
                아이디
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={form.userId}
                  onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                  placeholder="로그인 아이디"
                  required
                />
              </label>
              <label className={styles.fieldLabel}>
                이름
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="직원 이름"
                  required
                />
              </label>
              <label className={styles.fieldLabel}>
                비밀번호
                <input
                  className={styles.fieldInput}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="초기 비밀번호"
                  required
                />
              </label>
              {formError && <p className={styles.formError}>{formError}</p>}
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  취소
                </button>
                <button type="submit" className={styles.saveBtn} disabled={creating}>
                  {creating ? '생성 중...' : '계정 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
