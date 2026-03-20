'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/types/reservation';
import { SurveyResult, SurveyAnswers } from '@/types/survey';
import { getReservations } from '@/lib/api/reservation';
import { createSurveyToken, getSurveyToken, getSurveys, getAllSurveyTokens } from '@/lib/api/survey';
import styles from './page.module.css';

const SATISFACTION_LABELS = ['', '매우 만족', '만족', '보통', '불만족', '매우 불만족'];

type SatisfactionKey = 'staffService' | 'cleanliness' | 'facilities' | 'cafeteria' | 'pricing';

const SATISFACTION_ITEMS: { key: SatisfactionKey; label: string }[] = [
  { key: 'staffService', label: '직원 서비스' },
  { key: 'cleanliness', label: '청결 상태' },
  { key: 'facilities', label: '시설' },
  { key: 'cafeteria', label: '식당' },
  { key: 'pricing', label: '이용 비용' },
];

function parseAnswers(raw: string): SurveyAnswers | null {
  try {
    return JSON.parse(raw) as SurveyAnswers;
  } catch {
    return null;
  }
}

function SurveyResultView({ results }: { results: SurveyResult[] }) {
  if (results.length === 0) {
    return <p className={styles.noResult}>아직 제출된 설문이 없습니다.</p>;
  }

  return (
    <div className={styles.resultList}>
      {results.map((r, idx) => {
        const a = parseAnswers(r.answer);
        return (
          <div key={r.id} className={styles.resultCard}>
            <div className={styles.resultMeta}>
              <span className={styles.resultIdx}>응답 #{idx + 1}</span>
              <span className={styles.resultDate}>
                {new Date(r.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
            {a ? (
              <>
                <div className={styles.infoGrid}>
                  {a.location && <div className={styles.infoItem}><span className={styles.infoLabel}>위치</span>{a.location === '기타' ? a.locationEtc : a.location}</div>}
                  {a.industry && <div className={styles.infoItem}><span className={styles.infoLabel}>업태</span>{a.industry === '기타' ? a.industryEtc : a.industry}</div>}
                  {a.purpose && <div className={styles.infoItem}><span className={styles.infoLabel}>목적</span>{a.purpose === '기타' ? a.purposeEtc : a.purpose}</div>}
                  {a.visitRoute && <div className={styles.infoItem}><span className={styles.infoLabel}>계기</span>{a.visitRoute === '기타' ? a.visitRouteEtc : a.visitRoute}</div>}
                </div>
                <div className={styles.ratingGrid}>
                  {SATISFACTION_ITEMS.map(({ key, label }) => {
                    const score = a[key] as number;
                    return score > 0 ? (
                      <div key={key} className={styles.ratingItem}>
                        <span className={styles.ratingLabel}>{label}</span>
                        <span className={`${styles.satisfactionTag} ${score >= 4 ? styles.satisfactionTagBad : ''}`}>
                          {SATISFACTION_LABELS[score]}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
                {a.revisit && (
                  <p className={styles.comment}>
                    <span className={styles.commentLabel}>재방문</span> {a.revisit}
                  </p>
                )}
                {a.comment && (
                  <p className={styles.comment}>
                    <span className={styles.commentLabel}>의견</span> {a.comment}
                  </p>
                )}
              </>
            ) : (
              <pre className={styles.rawAnswer}>{r.answer}</pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface RowState {
  expanded: boolean;
  results: SurveyResult[] | null;
  loading: boolean;
  urlCreated: boolean;
  urlToken: string;
  urlLoading: boolean;
  copied: boolean;
}

export default function SurveyManagePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  useEffect(() => {
    Promise.all([getReservations(), getAllSurveyTokens()])
      .then(([list, tokens]) => {
        setReservations(list);
        const tokenMap = new Map(tokens.map((t) => [t.reservationId, t.token]));
        setRowState((prev) => {
          const next = { ...prev };
          list.forEach((r) => {
            const token = tokenMap.get(r.reservationCode);
            if (token) {
              next[r.reservationCode] = {
                ...(prev[r.reservationCode] ?? { expanded: false, results: null, loading: false, urlLoading: false, copied: false }),
                urlCreated: true,
                urlToken: token,
              };
            }
          });
          return next;
        });
      })
      .catch(() => alert('예약 목록을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reservations.filter((r) =>
    r.organization.includes(search) ||
    r.reservationCode.includes(search) ||
    r.customer.includes(search)
  );

  const getRow = (code: string): RowState =>
    rowState[code] ?? {
      expanded: false,
      results: null,
      loading: false,
      urlCreated: false,
      urlToken: '',
      urlLoading: false,
      copied: false,
    };

  const updateRow = (code: string, patch: Partial<RowState>) => {
    setRowState((prev) => ({
      ...prev,
      [code]: { ...getRow(code), ...patch },
    }));
  };

  const toggleExpand = async (r: Reservation) => {
    const row = getRow(r.reservationCode);
    if (row.expanded) {
      updateRow(r.reservationCode, { expanded: false });
      return;
    }
    updateRow(r.reservationCode, { expanded: true });

    const needsToken = !row.urlCreated;
    const needsResults = row.results === null;
    if (!needsToken && !needsResults) return;

    updateRow(r.reservationCode, { loading: true });
    const [tokenData, surveyData] = await Promise.all([
      needsToken ? getSurveyToken(r.reservationCode) : Promise.resolve(null),
      needsResults ? getSurveys(r.reservationCode).catch(() => []) : Promise.resolve(null),
    ]);

    updateRow(r.reservationCode, {
      loading: false,
      ...(tokenData ? { urlCreated: true, urlToken: tokenData.token } : {}),
      ...(surveyData !== null ? { results: surveyData } : {}),
    });
  };

  const handleCreateUrl = async (r: Reservation) => {
    updateRow(r.reservationCode, { urlLoading: true });
    try {
      const data = await createSurveyToken(r.reservationCode);
      updateRow(r.reservationCode, { urlCreated: true, urlToken: data.token, urlLoading: false });
    } catch {
      alert('URL 생성에 실패했습니다. 이미 생성된 URL이 있을 수 있습니다.');
      updateRow(r.reservationCode, { urlLoading: false });
    }
  };

  const handleCopy = (code: string, token: string) => {
    const url = `${window.location.origin}/survey/${token}`;
    const markCopied = () => {
      updateRow(code, { copied: true });
      setTimeout(() => updateRow(code, { copied: false }), 2000);
    };
    const fallback = () => {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      markCopied();
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(markCopied).catch(fallback);
    } else {
      fallback();
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>설문 관리</h2>
        <input
          className={styles.searchInput}
          placeholder="단체명 / 예약코드 / 담당자 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.empty}>불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>검색 결과가 없습니다.</div>
      ) : (
        <div className={styles.list}>
          {filtered.map((r) => {
            const row = getRow(r.reservationCode);
            return (
              <div key={r.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemInfo}>
                    <span className={styles.colorDot} style={{ backgroundColor: r.colorCode }} />
                    <span className={styles.org}>{r.organization}</span>
                    <span className={styles.code}>{r.reservationCode}</span>
                    <span className={styles.period}>{String(r.startDate)} ~ {String(r.endDate)}</span>
                    <span className={`${styles.badge} ${styles[r.status]}`}>{r.status}</span>
                  </div>
                  <div className={styles.itemActions}>
                    {!row.urlCreated ? (
                      <button
                        className={styles.urlBtn}
                        onClick={() => handleCreateUrl(r)}
                        disabled={row.urlLoading}
                      >
                        {row.urlLoading ? '생성 중...' : 'URL 생성'}
                      </button>
                    ) : (
                      <button
                        className={styles.copyBtn}
                        onClick={() => handleCopy(r.reservationCode, row.urlToken)}
                      >
                        {row.copied ? '복사됨 ✓' : 'URL 복사'}
                      </button>
                    )}
                    <button
                      className={`${styles.resultBtn} ${row.expanded ? styles.resultBtnActive : ''}`}
                      onClick={() => toggleExpand(r)}
                    >
                      결과 {row.expanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {row.expanded && (
                  <div className={styles.resultArea}>
                    {row.loading ? (
                      <p className={styles.noResult}>불러오는 중...</p>
                    ) : (
                      <SurveyResultView results={row.results ?? []} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
