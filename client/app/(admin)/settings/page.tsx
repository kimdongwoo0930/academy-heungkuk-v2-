"use client";

import {
  AccountInfo,
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccountPassword,
  updateAccountRole,
} from "@/lib/api/account";
import {
  exportReservations,
  importReservations,
  ImportResult,
} from "@/lib/api/reservation";
import { getSettings, saveSettings, getDisabledClassrooms, saveDisabledClassrooms } from "@/lib/api/settings";
import { CLASSROOM_CATEGORIES, CLASSROOM_LIST } from "@/lib/constants/classrooms";
import { isAdmin, parseJwtPayload } from "@/lib/utils/auth";
import {
  AppSettings,
  getDefaultAppSettings,
  parseSettings,
  serializeSettings,
  setCachedSettings,
} from "@/lib/utils/priceSettings";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
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

type TabKey = "account" | "price" | "classroom" | "backup";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "account", label: "계정 관리", icon: "👤" },
  { key: "price", label: "요금 · 담당자", icon: "💰" },
  { key: "classroom", label: "강의실 관리", icon: "🏫" },
  { key: "backup", label: "데이터 백업", icon: "💾" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("account");
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState<string | null>(() => getCurrentUserId());
  const [admin] = useState<boolean>(() => isAdmin());

  useEffect(() => {
    if (!isAdmin()) router.replace("/scheduler");
  }, [router]);

  // ── 설정 state ──
  const [appSettings, setAppSettings] = useState<AppSettings>(() =>
    getDefaultAppSettings(),
  );
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // ── 강의실 관리 state ──
  const [disabledClassrooms, setDisabledClassrooms] = useState<Set<string>>(new Set());
  const [classroomSaving, setClassroomSaving] = useState(false);
  const [classroomSaved, setClassroomSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then((raw) => {
        const parsed = parseSettings(raw);
        setAppSettings(parsed);
        setCachedSettings(parsed);
      })
      .catch(() => {
        /* 서버 미설정 시 기본값 사용 */
      });
    getDisabledClassrooms()
      .then((codes) => setDisabledClassrooms(new Set(codes)))
      .catch(() => {});
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
      alert("수정 권한이 없습니다.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const setPrice = (key: string, value: number) => {
    if (key in appSettings.prices.classrooms) {
      setAppSettings((s) => ({
        ...s,
        prices: {
          ...s.prices,
          classrooms: { ...s.prices.classrooms, [key]: value },
        },
      }));
    } else {
      setAppSettings((s) => ({ ...s, prices: { ...s.prices, [key]: value } }));
    }
  };

  const setContact = (key: keyof AppSettings["contact"], value: string) => {
    setAppSettings((s) => ({ ...s, contact: { ...s.contact, [key]: value } }));
  };

  const toggleDisabledClassroom = (code: string) => {
    setDisabledClassrooms((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleClassroomSave = async () => {
    setClassroomSaving(true);
    try {
      await saveDisabledClassrooms(Array.from(disabledClassrooms));
      setClassroomSaved(true);
      setTimeout(() => setClassroomSaved(false), 2000);
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setClassroomSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReservations();
    } catch {
      alert("내보내기에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (
      !confirm(
        `'${file.name}' 파일로 예약 데이터를 가져옵니다.\n기존 예약은 덮어씌워집니다. 계속하시겠습니까?`,
      )
    )
      return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importReservations(file);
      setImportResult(result);
    } catch {
      alert("가져오기에 실패했습니다.");
    } finally {
      setImporting(false);
    }
  };

  // ── 계정 관리 ──
  const [pwTarget, setPwTarget] = useState<AccountInfo | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [pwChanging, setPwChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pwTarget) return;
    setPwChanging(true);
    try {
      await updateAccountPassword(pwTarget.id, newPassword);
      setPwTarget(null);
      setNewPassword("");
    } catch {
      alert("비밀번호 변경에 실패했습니다.");
    } finally {
      setPwChanging(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>({
    userId: "",
    username: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => alert("계정 목록을 불러오는데 실패했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleRole = async (acc: AccountInfo) => {
    if (!admin) return;
    const newRole = acc.role === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN";
    try {
      await updateAccountRole(acc.id, newRole);
      setAccounts((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, role: newRole } : a)),
      );
    } catch {
      alert("권한 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number, userId: string) => {
    if (!admin) return;
    if (!confirm(`'${userId}' 계정을 삭제하시겠습니까?`)) return;
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("계정 삭제에 실패했습니다.");
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      const created = await createAccount(form);
      setAccounts((prev) => [...prev, created]);
      setShowModal(false);
      setForm({ userId: "", username: "", password: "" });
    } catch {
      setFormError("이미 사용 중인 아이디이거나 오류가 발생했습니다.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.layout}>
      {/* 사이드 탭 */}
      <nav className={styles.sidebar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* 콘텐츠 영역 */}
      <div className={styles.content}>
        {/* 계정 관리 */}
        {activeTab === "account" && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>계정 관리</h2>
                <p className={styles.panelDesc}>
                  시스템 접근 계정을 추가하거나 권한을 변경합니다.
                </p>
              </div>
              {admin && (
                <button
                  className={styles.addBtn}
                  onClick={() => setShowModal(true)}
                >
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
                    <tr>
                      <td colSpan={admin ? 5 : 4} className={styles.empty}>
                        불러오는 중...
                      </td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={admin ? 5 : 4} className={styles.empty}>
                        계정이 없습니다.
                      </td>
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
                              className={`${styles.roleBtn} ${acc.role === "ROLE_ADMIN" ? styles.admin : styles.user}`}
                              onClick={() => handleToggleRole(acc)}
                              disabled={!admin || isSelf}
                            >
                              {acc.role === "ROLE_ADMIN" ? "관리자" : "일반"}
                            </button>
                          </td>
                          <td className={styles.date}>
                            {acc.createdAt?.slice(0, 10)}
                          </td>
                          {admin && (
                            <td className={styles.actionCell}>
                              <button
                                className={styles.pwBtn}
                                onClick={() => {
                                  setPwTarget(acc);
                                  setNewPassword("");
                                }}
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
        )}

        {/* 요금 / 담당자 설정 */}
        {activeTab === "price" && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>요금 · 담당자 설정</h2>
                <p className={styles.panelDesc}>
                  강의실 요금, 숙박/식비, 담당자 정보를 설정합니다.
                </p>
              </div>
              <button
                className={styles.saveBtn}
                onClick={handleSettingsSave}
                disabled={settingsSaving}
              >
                {settingsSaved
                  ? "저장됨 ✓"
                  : settingsSaving
                    ? "저장 중..."
                    : "저장"}
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
                    onChange={(e) =>
                      setPrice("roomPrice", Number(e.target.value))
                    }
                  />
                </label>
                <label className={styles.priceRow}>
                  <span className={styles.priceLabel}>식비 (일반)</span>
                  <input
                    className={styles.priceInput}
                    type="number"
                    value={appSettings.prices.mealPrice}
                    onChange={(e) =>
                      setPrice("mealPrice", Number(e.target.value))
                    }
                  />
                </label>
                <label className={styles.priceRow}>
                  <span className={styles.priceLabel}>식비 (특식)</span>
                  <input
                    className={styles.priceInput}
                    type="number"
                    value={appSettings.prices.specialMealPrice}
                    onChange={(e) =>
                      setPrice("specialMealPrice", Number(e.target.value))
                    }
                  />
                </label>
              </div>

              {/* 담당자 / 대표이사 */}
              <div className={styles.priceBlock}>
                <h3 className={styles.priceBlockTitle}>담당자 / 대표이사</h3>
                {(
                  [
                    { key: "representative", label: "대표이사" },
                    { key: "manager", label: "담당자" },
                    { key: "phone", label: "전화번호" },
                    { key: "fax", label: "팩스번호" },
                    { key: "email", label: "이메일" },
                  ] as { key: keyof AppSettings["contact"]; label: string }[]
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
        )}

        {/* 강의실 관리 */}
        {activeTab === "classroom" && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>강의실 관리</h2>
                <p className={styles.panelDesc}>
                  클릭하여 예약 불가 강의실을 설정합니다. 대시보드에서 사용불가로 표시됩니다.
                </p>
              </div>
              <button
                className={styles.saveBtn}
                onClick={handleClassroomSave}
                disabled={classroomSaving}
              >
                {classroomSaved ? "저장됨 ✓" : classroomSaving ? "저장 중..." : "저장"}
              </button>
            </div>
            <div className={styles.classroomHead}>
              <span className={styles.classroomCount}>
                사용불가 {disabledClassrooms.size}개 / 전체 {CLASSROOM_LIST.length}개
              </span>
            </div>
            <div className={styles.classroomGrid}>
              {CLASSROOM_LIST.map((room) => {
                const isDisabled = disabledClassrooms.has(room.code);
                return (
                  <button
                    key={room.code}
                    className={`${styles.classroomItem} ${isDisabled ? styles.classroomDisabled : styles.classroomAvailable}`}
                    onClick={() => toggleDisabledClassroom(room.code)}
                  >
                    <div className={styles.classroomName}>{room.name}</div>
                    <div className={styles.classroomCap}>{room.capacity}인</div>
                    <div className={styles.classroomStatus}>
                      ● {isDisabled ? "사용불가" : "사용 가능"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 업데이트 내역 */}
        {activeTab === "changelog" && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>업데이트 내역</h2>
                <p className={styles.panelDesc}>
                  시스템 버전별 변경 이력입니다.
                </p>
              </div>
            </div>
            <div className={styles.changelogBody}>
              {changelog ? (
                changelog.split("\n").map((line, i) => {
                  if (line.startsWith("## "))
                    return (
                      <h2 key={i} className={styles.clH2}>
                        {line.replace("## ", "")}
                      </h2>
                    );
                  if (line.startsWith("### "))
                    return (
                      <h3 key={i} className={styles.clH3}>
                        {line.replace("### ", "")}
                      </h3>
                    );
                  if (line.startsWith("# "))
                    return (
                      <h1 key={i} className={styles.clH1}>
                        {line.replace("# ", "")}
                      </h1>
                    );
                  if (line.startsWith("- "))
                    return (
                      <p key={i} className={styles.clItem}>
                        · {line.replace("- ", "")}
                      </p>
                    );
                  if (line === "---")
                    return <hr key={i} className={styles.clDivider} />;
                  if (line.trim() === "")
                    return <div key={i} className={styles.clGap} />;
                  return (
                    <p key={i} className={styles.clText}>
                      {line}
                    </p>
                  );
                })
              ) : (
                <p className={styles.empty}>불러오는 중...</p>
              )}
            </div>
          </div>
        )}

        {/* 데이터 백업 */}
        {activeTab === "backup" && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>데이터 백업</h2>
                <p className={styles.panelDesc}>
                  예약 데이터를 xlsx 파일로 내보내거나 가져옵니다.
                </p>
              </div>
            </div>
            <div className={styles.backupBlock}>
              <div className={styles.backupRow}>
                <div className={styles.backupInfo}>
                  <p className={styles.backupLabel}>예약 데이터 내보내기</p>
                  <p className={styles.backupDesc}>
                    모든 예약 정보를 xlsx 파일로 다운로드합니다.
                  </p>
                </div>
                <button
                  className={styles.exportBtn}
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? "다운로드 중..." : "xlsx 내보내기"}
                </button>
              </div>
              <div className={styles.backupDivider} />
              <div className={styles.backupRow}>
                <div className={styles.backupInfo}>
                  <p className={styles.backupLabel}>예약 데이터 가져오기</p>
                  <p className={styles.backupDesc}>
                    내보내기한 xlsx 파일로 데이터를 복원합니다. 예약 코드
                    기준으로 덮어씁니다.
                  </p>
                  {importResult && (
                    <p className={styles.importResult}>
                      완료 — 신규 {importResult.created}건 / 수정{" "}
                      {importResult.updated}건
                      {importResult.failed > 0 &&
                        ` / 실패 ${importResult.failed}건`}
                    </p>
                  )}
                </div>
                <label
                  className={`${styles.importBtn} ${importing ? styles.importing : ""}`}
                >
                  {importing ? "가져오는 중..." : "xlsx 가져오기"}
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleImport}
                    disabled={importing}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 비밀번호 변경 모달 */}
      {pwTarget && (
        <div className={styles.overlay} onClick={() => setPwTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {pwTarget.username} 비밀번호 변경
              </span>
              <button
                className={styles.closeBtn}
                onClick={() => setPwTarget(null)}
              >
                ✕
              </button>
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
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setPwTarget(null)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                  disabled={pwChanging}
                >
                  {pwChanging ? "변경 중..." : "변경"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 멤버 추가 모달 */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>멤버 추가</span>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form className={styles.modalBody} onSubmit={handleCreate}>
              <label className={styles.fieldLabel}>
                아이디
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={form.userId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, userId: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="초기 비밀번호"
                  required
                />
              </label>
              {formError && <p className={styles.formError}>{formError}</p>}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                  disabled={creating}
                >
                  {creating ? "생성 중..." : "계정 생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
