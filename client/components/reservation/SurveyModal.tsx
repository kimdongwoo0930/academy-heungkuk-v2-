'use client';

import { useState } from 'react';
import { createSurveyToken, getSurveys } from '@/lib/api/survey';
import { SurveyTokenResponse, SurveyResult, SurveyAnswers } from '@/types/survey';
import styles from './SurveyModal.module.css';

interface Props {
  reservationCode: string;
  organization: string;
  onClose: () => void;
}

type Tab = 'url' | 'result';

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

export default function SurveyModal({ reservationCode, organization, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('url');
  const [tokenData, setTokenData] = useState<SurveyTokenResponse | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState<SurveyResult[] | null>(null);
  const [resultLoading, setResultLoading] = useState(false);

  const surveyUrl = tokenData
    ? `${window.location.origin}/survey/${tokenData.token}`
    : '';

  const handleCreateUrl = async () => {
    setUrlLoading(true);
    try {
      const data = await createSurveyToken(reservationCode);
      setTokenData(data);
    } catch {
      alert('설문 URL 생성에 실패했습니다.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleCopy = () => {
    const markCopied = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    const fallback = () => {
      const el = document.createElement('textarea');
      el.value = surveyUrl;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      markCopied();
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(surveyUrl).then(markCopied).catch(fallback);
    } else {
      fallback();
    }
  };

  const handleTabResult = async () => {
    setTab('result');
    if (results !== null) return;
    setResultLoading(true);
    try {
      const data = await getSurveys(reservationCode);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setResultLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>설문 관리</div>
            <div className={styles.modalSub}>{organization} · {reservationCode}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'url' ? styles.tabActive : ''}`}
            onClick={() => setTab('url')}
          >
            URL 생성
          </button>
          <button
            className={`${styles.tab} ${tab === 'result' ? styles.tabActive : ''}`}
            onClick={handleTabResult}
          >
            결과 조회
          </button>
        </div>

        <div className={styles.body}>
          {tab === 'url' && (
            <div className={styles.urlSection}>
              {!tokenData ? (
                <>
                  <p className={styles.desc}>
                    고객에게 전달할 설문 URL을 생성합니다.<br />
                    생성된 URL은 1회만 사용 가능합니다.
                  </p>
                  <button
                    className={styles.createBtn}
                    onClick={handleCreateUrl}
                    disabled={urlLoading}
                  >
                    {urlLoading ? '생성 중...' : '설문 URL 생성'}
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.desc}>설문 URL이 생성되었습니다. 고객에게 전달하세요.</p>
                  <div className={styles.urlBox}>
                    <span className={styles.urlText}>{surveyUrl}</span>
                    <button className={styles.copyBtn} onClick={handleCopy}>
                      {copied ? '복사됨 ✓' : '복사'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'result' && (
            <div className={styles.resultSection}>
              {resultLoading ? (
                <p className={styles.empty}>불러오는 중...</p>
              ) : !results || results.length === 0 ? (
                <p className={styles.empty}>아직 제출된 설문이 없습니다.</p>
              ) : (
                results.map((r, idx) => {
                  const answers = parseAnswers(r.answer);
                  return (
                    <div key={r.id} className={styles.resultCard}>
                      <div className={styles.resultNum}>응답 #{idx + 1}</div>
                      <div className={styles.resultDate}>
                        {new Date(r.createdAt).toLocaleString('ko-KR')}
                      </div>
                      {answers ? (
                        <>
                          <div className={styles.infoGrid}>
                            {answers.location && <span className={styles.infoTag}><b>위치</b>{answers.location === '기타' ? answers.locationEtc : answers.location}</span>}
                            {answers.industry && <span className={styles.infoTag}><b>업태</b>{answers.industry === '기타' ? answers.industryEtc : answers.industry}</span>}
                            {answers.purpose && <span className={styles.infoTag}><b>목적</b>{answers.purpose === '기타' ? answers.purposeEtc : answers.purpose}</span>}
                            {answers.visitRoute && <span className={styles.infoTag}><b>계기</b>{answers.visitRoute === '기타' ? answers.visitRouteEtc : answers.visitRoute}</span>}
                          </div>
                          <div className={styles.ratingList}>
                            {SATISFACTION_ITEMS.map(({ key, label }) => {
                              const score = answers[key] as number;
                              return score > 0 ? (
                                <div key={key} className={styles.ratingRow}>
                                  <span className={styles.ratingLabel}>{label}</span>
                                  <span className={`${styles.ratingScore} ${score >= 4 ? styles.ratingScoreBad : ''}`}>
                                    {SATISFACTION_LABELS[score]}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          </div>
                          {answers.revisit && (
                            <div className={styles.comment}>
                              <span className={styles.commentLabel}>재방문</span>
                              <p className={styles.commentText}>{answers.revisit}</p>
                            </div>
                          )}
                          {answers.comment && (
                            <div className={styles.comment}>
                              <span className={styles.commentLabel}>자유 의견</span>
                              <p className={styles.commentText}>{answers.comment}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <pre className={styles.rawAnswer}>{r.answer}</pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
