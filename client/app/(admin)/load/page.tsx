'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/types/reservation';
import { SurveyResult, SurveyAnswers } from '@/types/survey';
import { getReservations } from '@/lib/api/reservation';
import { createSurveyToken, getSurveyToken, getSurveys } from '@/lib/api/survey';
import styles from './page.module.css';

const LABEL_MAP: Record<keyof Omit<SurveyAnswers, 'comment'>, string> = {
  facility: '시설',
  meal: '식사',
  service: '서비스',
  classroom: '강의실',
  overall: '전체',
};

function parseAnswers(raw: string): SurveyAnswers | null {
  try {
    return JSON.parse(raw) as SurveyAnswers;
  } catch {
    return null;
  }
}

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? styles.starOn : styles.starOff}>★</span>
      ))}
      <span className={styles.scoreNum}>{value}점</span>
    </span>
  );
}

function SurveyResultView({ results }: { results: SurveyResult[] }) {
  if (results.length === 0) {
    return <p className={styles.noResult}>아직 제출된 설문이 없습니다.</p>;
  }

  return (
    <div className={styles.resultList}>
      {results.map((r, idx) => {
        const answers = parseAnswers(r.answer);
        return (
          <div key={r.id} className={styles.resultCard}>
            <div className={styles.resultMeta}>
              <span className={styles.resultIdx}>응답 #{idx + 1}</span>
              <span className={styles.resultDate}>
                {new Date(r.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
            {answers ? (
              <>
                <div className={styles.ratingGrid}>
                  {(Object.keys(LABEL_MAP) as (keyof typeof LABEL_MAP)[]).map((key) => (
                    <div key={key} className={styles.ratingItem}>
                      <span className={styles.ratingLabel}>{LABEL_MAP[key]}</span>
                      <Stars value={answers[key]} />
                    </div>
                  ))}
                </div>
                {answers.comment && (
                  <p className={styles.comment}>
                    <span className={styles.commentLabel}>의견</span> {answers.comment}
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
    getReservations()
      .then(setReservations)
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
    navigator.clipboard.writeText(url).then(() => {
      updateRow(code, { copied: true });
      setTimeout(() => updateRow(code, { copied: false }), 2000);
    });
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
