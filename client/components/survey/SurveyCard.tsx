'use client';

import { SurveyResult } from '@/types/survey';
import { useState } from 'react';
import styles from './SurveyCard.module.css';

const SCORE_LABELS  = ['', '매우불만족', '불만족', '보통', '만족', '매우만족'];
const SCORE_COLORS  = ['', '#dc2626', '#e8306a', '#d97706', '#2563eb', '#0eab6e'];
const SCORE_BG      = ['', 'rgba(220,38,38,0.1)', 'rgba(232,48,106,0.1)', 'rgba(217,119,6,0.1)', 'rgba(37,99,235,0.1)', 'rgba(14,171,110,0.1)'];

const SCORE_ITEMS: { key: keyof Pick<SurveyResult, 'staffService'|'cleanliness'|'facilities'|'cafeteria'|'pricing'>; label: string }[] = [
  { key: 'staffService', label: '직원서비스' },
  { key: 'cleanliness',  label: '청결' },
  { key: 'facilities',   label: '시설' },
  { key: 'cafeteria',    label: '식당' },
  { key: 'pricing',      label: '비용' },
];

function avgScore(data: SurveyResult) {
  const scores = SCORE_ITEMS.map((i) => data[i.key] as number);
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return '-';
  if (!end || end === start) return start;
  return `${start} ~ ${end}`;
}

function formatResponseTime(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props { data: SurveyResult }

export default function SurveyCard({ data }: Props) {
  const [open, setOpen] = useState(false);

  const dotColor = data.colorCode ?? '#9e9aad';
  const avg = avgScore(data);
  const revisitCls =
    data.revisit === '매우 그렇다' ? styles.chipVg :
    data.revisit === '그렇다'      ? styles.chipGd : styles.chipNm;

  const location = data.locationEtc ? `${data.location} (${data.locationEtc})` : data.location;
  const purpose  = data.purposeEtc  ? `${data.purpose} (${data.purposeEtc})`   : data.purpose;
  const industry = data.industryEtc ? `${data.industry} (${data.industryEtc})` : data.industry;
  const visitRoute = data.visitRouteEtc ? `${data.visitRoute} (${data.visitRouteEtc})` : data.visitRoute;

  return (
    <div className={styles.card}>
      {/* ── 헤더 (클릭해서 접기/펼치기) ── */}
      <div className={styles.header} onClick={() => setOpen((v) => !v)}>
        <div className={styles.dot} style={{ background: dotColor }} />

        <div className={styles.headerInfo}>
          <div className={styles.orgName}>{data.organization ?? '-'}</div>
          <div className={styles.orgMeta}>
            {data.reservationId} · {data.customer ?? '-'} · {formatDateRange(data.startDate, data.endDate)}
          </div>
        </div>

        {/* 점수 미니 배지 5개 */}
        <div className={styles.scoreBadges}>
          {SCORE_ITEMS.map((item) => {
            const s = data[item.key] as number;
            return (
              <div
                key={item.key}
                className={styles.scoreBadge}
                style={{ color: SCORE_COLORS[s], background: SCORE_BG[s] }}
                title={`${item.label}: ${SCORE_LABELS[s]}`}
              >
                <span className={styles.scoreBadgeKey}>{item.label}</span>
                <span className={styles.scoreBadgeVal}>{SCORE_LABELS[s]}</span>
              </div>
            );
          })}
        </div>

        {/* 평균 + 재방문 */}
        <div className={styles.headerRight}>
          <div className={styles.avgBadge}>
            ★ {avg}
          </div>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>▼</span>
        </div>
      </div>

      {/* ── 펼쳐진 내용 ── */}
      {open && (
        <div className={styles.body}>
          <div className={styles.respTime}>{formatResponseTime(data.createdAt)}</div>

          {/* 태그 4개 */}
          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles.tag_loc}`}>📍 {location}</span>
            <span className={`${styles.tag} ${styles.tag_goal}`}>🎯 {purpose}</span>
            <span className={`${styles.tag} ${styles.tag_industry}`}>🏢 {industry}</span>
            <span className={`${styles.tag} ${styles.tag_route}`}>🔗 {visitRoute}</span>
          </div>

          {/* 점수 상세 */}
          <div className={styles.scoreGrid}>
            {SCORE_ITEMS.map((item) => {
              const s = data[item.key] as number;
              const commentKey = (item.key + 'Comment') as keyof SurveyResult;
              const comment = data[commentKey] as string | null;
              return (
                <div
                  key={item.key}
                  className={styles.scoreItem}
                  style={{ borderTop: `3px solid ${SCORE_COLORS[s]}` }}
                >
                  <div className={styles.scoreLabel}>{item.label}</div>
                  <div className={styles.scoreVal} style={{ color: SCORE_COLORS[s] }}>
                    {SCORE_LABELS[s]}
                  </div>
                  {comment && (
                    <div className={styles.scoreComment}>&ldquo;{comment}&rdquo;</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 재방문 + 종합 의견 */}
          <div className={styles.bottom}>
            <div className={styles.revisitWrap}>
              <span className={styles.revisitLabel}>재방문 의향</span>
              <span className={`${styles.chip} ${revisitCls}`}>{data.revisit}</span>
              {data.revisitComment && (
                <span className={styles.revisitComment}>{data.revisitComment}</span>
              )}
            </div>
            {data.comment && (
              <div className={styles.opinion}>&ldquo;{data.comment}&rdquo;</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
