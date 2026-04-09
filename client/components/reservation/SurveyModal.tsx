"use client";

import {
  createSurveyToken,
  getSurveyToken,
  getSurveys,
} from "@/lib/api/survey";
import {
  SurveyAnswers,
  SurveyResult,
  SurveyTokenResponse,
} from "@/types/survey";
import { useEffect, useState } from "react";
import styles from "./SurveyModal.module.css";

interface Props {
  reservationCode: string;
  organization: string;
  onClose: () => void;
}

type Tab = "url" | "result";

const SATISFACTION_LABELS: Record<number, { text: string; bad: boolean }> = {
  1: { text: "매우 만족", bad: false },
  2: { text: "만족", bad: false },
  3: { text: "보통", bad: false },
  4: { text: "불만족", bad: true },
  5: { text: "매우 불만족", bad: true },
};

const SATISFACTION_ITEMS: {
  key: keyof SurveyAnswers;
  label: string;
  commentKey: keyof SurveyAnswers;
}[] = [
  {
    key: "staffService",
    label: "직원 서비스",
    commentKey: "staffServiceComment",
  },
  { key: "cleanliness", label: "청결 상태", commentKey: "cleanlinessComment" },
  { key: "facilities", label: "시설", commentKey: "facilitiesComment" },
  { key: "cafeteria", label: "식당", commentKey: "cafeteriaComment" },
  { key: "pricing", label: "이용 비용", commentKey: "pricingComment" },
];

const REVISIT_LABELS: Record<string, string> = {
  very_likely: "매우 그렇다",
  likely: "그렇다",
  possible: "불만사항이 개선될 경우 검토 가능",
  unlikely: "재방문 의향 없다",
};

function parseAnswers(raw: string): SurveyAnswers | null {
  try {
    return JSON.parse(raw) as SurveyAnswers;
  } catch {
    return null;
  }
}

export default function SurveyModal({
  reservationCode,
  organization,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>("url");
  const [tokenData, setTokenData] = useState<SurveyTokenResponse | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState<SurveyResult[] | null>(null);
  const [resultLoading, setResultLoading] = useState(false);

  const surveyUrl = tokenData
    ? `${window.location.origin}/survey/${tokenData.token}`
    : "";

  // 모달 열릴 때 기존 토큰 조회
  useEffect(() => {
    getSurveyToken(reservationCode).then((existing) => {
      if (existing) setTokenData(existing);
    });
  }, [reservationCode]);

  const handleCreateUrl = async () => {
    setUrlLoading(true);
    try {
      // 기존 토큰이 있으면 재사용, 없으면 새로 생성
      const existing = await getSurveyToken(reservationCode);
      if (existing) {
        setTokenData(existing);
      } else {
        const data = await createSurveyToken(reservationCode);
        setTokenData(data);
      }
    } catch {
      alert("설문 URL 생성에 실패했습니다.");
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
      const el = document.createElement("textarea");
      el.value = surveyUrl;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
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
    setTab("result");
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
            <div className={styles.modalSub}>
              {organization} · {reservationCode}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "url" ? styles.tabActive : ""}`}
            onClick={() => setTab("url")}
          >
            URL 생성
          </button>
          <button
            className={`${styles.tab} ${tab === "result" ? styles.tabActive : ""}`}
            onClick={handleTabResult}
          >
            결과 조회
          </button>
        </div>

        <div className={styles.body}>
          {tab === "url" && (
            <div className={styles.urlSection}>
              {!tokenData ? (
                <>
                  <p className={styles.desc}>
                    고객에게 전달할 설문 URL을 생성합니다.
                  </p>
                  <button
                    className={styles.createBtn}
                    onClick={handleCreateUrl}
                    disabled={urlLoading}
                  >
                    {urlLoading ? "생성 중..." : "설문 URL 생성"}
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.desc}>
                    설문 URL이 생성되었습니다. 고객에게 전달하세요.
                  </p>
                  <div className={styles.urlBox}>
                    <span className={styles.urlText}>{surveyUrl}</span>
                    <button className={styles.copyBtn} onClick={handleCopy}>
                      {copied ? "복사됨 ✓" : "복사"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "result" && (
            <div className={styles.resultSection}>
              {resultLoading ? (
                <p className={styles.empty}>불러오는 중...</p>
              ) : !results || results.length === 0 ? (
                <p className={styles.empty}>아직 제출된 설문이 없습니다.</p>
              ) : (
                results.map((r) => {
                  const a = parseAnswers(r.answer);
                  return (
                    <div key={r.id} className={styles.resultCard}>
                      <div className={styles.resultDate}>
                        {new Date(r.createdAt).toLocaleString("ko-KR")}
                      </div>
                      {a ? (
                        <>
                          <div className={styles.infoGrid}>
                            {a.location && (
                              <span className={styles.infoTag}>
                                <b>위치</b>{" "}
                                {a.location === "기타"
                                  ? a.locationEtc
                                  : a.location}
                              </span>
                            )}
                            {a.industry && (
                              <span className={styles.infoTag}>
                                <b>업태</b>{" "}
                                {a.industry === "기타"
                                  ? a.industryEtc
                                  : a.industry}
                              </span>
                            )}
                            {a.purpose && (
                              <span className={styles.infoTag}>
                                <b>목적</b>{" "}
                                {a.purpose === "기타"
                                  ? a.purposeEtc
                                  : a.purpose}
                              </span>
                            )}
                            {a.visitRoute && (
                              <span className={styles.infoTag}>
                                <b>계기</b>{" "}
                                {a.visitRoute === "기타"
                                  ? a.visitRouteEtc
                                  : a.visitRoute}
                              </span>
                            )}
                          </div>
                          <div className={styles.ratingList}>
                            {SATISFACTION_ITEMS.map(
                              ({ key, label, commentKey }) => {
                                const score = a[key] as number;
                                const comment = a[commentKey] as string;
                                const sat = SATISFACTION_LABELS[score];
                                if (!score || !sat) return null;
                                return (
                                  <div
                                    key={String(key)}
                                    className={styles.ratingRow}
                                  >
                                    <span className={styles.ratingLabel}>
                                      {label}
                                    </span>
                                    <span
                                      className={`${styles.ratingScore} ${sat.bad ? styles.ratingScoreBad : ""}`}
                                    >
                                      {sat.text}
                                    </span>
                                    {comment && (
                                      <span className={styles.ratingComment}>
                                        {comment}
                                      </span>
                                    )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                          {a.revisit && (
                            <div className={styles.comment}>
                              <span className={styles.commentLabel}>
                                재방문
                              </span>
                              <p className={styles.commentText}>
                                {REVISIT_LABELS[a.revisit] ?? a.revisit}
                              </p>
                            </div>
                          )}
                          {a.comment && (
                            <div className={styles.comment}>
                              <span className={styles.commentLabel}>
                                자유 의견
                              </span>
                              <p className={styles.commentText}>{a.comment}</p>
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
