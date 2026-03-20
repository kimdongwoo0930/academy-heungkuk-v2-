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

const LABEL_MAP: Record<keyof Omit<SurveyAnswers, 'comment'>, string> = {
  facility: '시설 만족도',
  meal: '식사 만족도',
  service: '서비스 만족도',
  classroom: '강의실 만족도',
  overall: '전체 만족도',
};

function parseAnswers(raw: string): SurveyAnswers | null {
  try {
    return JSON.parse(raw) as SurveyAnswers;
  } catch {
    return null;
  }
}

function StarDisplay({ value }: { value: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? styles.starOn : styles.starOff}>★</span>
      ))}
      <span className={styles.scoreText}>{value}점</span>
    </span>
  );
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
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
                          <div className={styles.ratingList}>
                            {(Object.keys(LABEL_MAP) as (keyof typeof LABEL_MAP)[]).map((key) => (
                              <div key={key} className={styles.ratingRow}>
                                <span className={styles.ratingLabel}>{LABEL_MAP[key]}</span>
                                <StarDisplay value={answers[key]} />
                              </div>
                            ))}
                          </div>
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
