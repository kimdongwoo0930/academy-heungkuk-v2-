'use client';

import { useState, useEffect } from 'react';
import { SurveyResult } from '@/types/survey';
import { getAllSurveys } from '@/lib/api/survey';
import {
  SATISFACTION_LABELS,
  SATISFACTION_ITEMS,
  REVISIT_LABELS,
} from '@/lib/constants/survey';
import { parseAnswers } from '@/lib/utils/surveyHelpers';
import styles from './page.module.css';


interface SurveyGroup {
  reservationId: string;
  organization: string | null;
  customer: string | null;
  startDate: string | null;
  endDate: string | null;
  colorCode: string | null;
  results: SurveyResult[];
}

function ResultCard({ result }: { result: SurveyResult }) {
  const [open, setOpen] = useState(false);
  const a = parseAnswers(result.answer);

  return (
    <div className={styles.resultCard}>
      <button className={styles.resultMeta} onClick={() => setOpen((v) => !v)}>
        <span className={styles.resultDate}>{new Date(result.createdAt).toLocaleString('ko-KR')}</span>
        <span className={styles.toggleIcon}>{open ? '▲' : '▼'}</span>
      </button>

      {open && a ? (
        <div className={styles.resultBody}>
          <div className={styles.infoGrid}>
            {a.location && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>위치</span>
                {a.location === '기타' ? a.locationEtc : a.location}
              </div>
            )}
            {a.industry && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>업태</span>
                {a.industry === '기타' ? a.industryEtc : a.industry}
              </div>
            )}
            {a.purpose && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>목적</span>
                {a.purpose === '기타' ? a.purposeEtc : a.purpose}
              </div>
            )}
            {a.visitRoute && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>계기</span>
                {a.visitRoute === '기타' ? a.visitRouteEtc : a.visitRoute}
              </div>
            )}
          </div>

          <div className={styles.satisfactionGrid}>
            {SATISFACTION_ITEMS.map(({ key, label, commentKey }) => {
              const score = a[key] as number;
              const comment = a[commentKey] as string;
              const sat = SATISFACTION_LABELS[score];
              if (!score) return null;
              return (
                <div key={String(key)} className={styles.satisfactionItem}>
                  <div className={styles.satHeader}>
                    <span className={styles.satLabel}>{label}</span>
                    <span className={`${styles.satScore} ${sat.bad ? styles.satScoreBad : ''}`}>
                      {sat.text}
                    </span>
                  </div>
                  {comment && <p className={styles.satComment}>{comment}</p>}
                </div>
              );
            })}
          </div>

          <div className={styles.bottomSection}>
            {a.revisit && (
              <div className={styles.bottomItem}>
                <span className={styles.bottomLabel}>재방문 의향</span>
                <span className={`${styles.revisitBadge} ${(a.revisit === 'unlikely' || a.revisit === 'possible') ? styles.revisitBadgeBad : styles.revisitBadgeGood}`}>
                  {REVISIT_LABELS[a.revisit] ?? a.revisit}
                </span>
                {a.revisitComment && <span className={styles.revisitComment}>{a.revisitComment}</span>}
              </div>
            )}
            {a.comment && (
              <div className={styles.bottomItem}>
                <span className={styles.bottomLabel}>자유 의견</span>
                <p className={styles.freeComment}>{a.comment}</p>
              </div>
            )}
          </div>
        </div>
      ) : open && (
        <pre className={styles.rawAnswer}>{result.answer}</pre>
      )}
    </div>
  );
}

export default function SurveyResultPage() {
  const [groups, setGroups] = useState<SurveyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllSurveys()
      .then((surveys) => {
        const map = new Map<string, SurveyGroup>();
        surveys.forEach((s) => {
          if (!map.has(s.reservationId)) {
            map.set(s.reservationId, {
              reservationId: s.reservationId,
              organization: s.organization,
              customer: s.customer,
              startDate: s.startDate,
              endDate: s.endDate,
              colorCode: s.colorCode,
              results: [],
            });
          }
          map.get(s.reservationId)!.results.push(s);
        });
        setGroups(Array.from(map.values()));
      })
      .catch(() => alert('데이터를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = groups.filter((g) =>
    (g.organization ?? '').includes(search) ||
    g.reservationId.includes(search) ||
    (g.customer ?? '').includes(search)
  );

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>설문 결과</h2>
          <p className={styles.subtitle}>설문이 완료된 예약의 응답을 확인합니다.</p>
        </div>
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
        <div className={styles.empty}>완료된 설문이 없습니다.</div>
      ) : (
        <div className={styles.groupList}>
          {filtered.map((g) => (
            <div key={g.reservationId} className={styles.groupCard}>
              <div className={styles.groupHeader}>
                {g.colorCode && (
                  <span className={styles.colorDot} style={{ backgroundColor: g.colorCode }} />
                )}
                <span className={styles.org}>{g.organization ?? '-'}</span>
                <span className={styles.code}>{g.reservationId}</span>
                {g.customer && <span className={styles.customer}>{g.customer}</span>}
                {g.startDate && g.endDate && (
                  <span className={styles.period}>{g.startDate} ~ {g.endDate}</span>
                )}
                <span className={styles.responseCount}>응답 {g.results.length}건</span>
              </div>

              <div className={styles.resultList}>
                {g.results.map((r) => (
                  <ResultCard key={r.id} result={r} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
