"use client";

import {
  createSurveyToken,
  getSurveyToken,
  getSurveys,
} from "@/lib/api/survey";
import {
  SATISFACTION_LABELS,
  SATISFACTION_ITEMS,
  REVISIT_LABELS,
} from "@/lib/constants/survey";
import {
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
                results.map((r) => (
                  <div key={r.id} className={styles.resultCard}>
                    <div className={styles.resultDate}>
                      {new Date(r.createdAt).toLocaleString("ko-KR")}
                    </div>
                    <div className={styles.infoGrid}>
                      {r.location && (
                        <span className={styles.infoTag}>
                          <b>위치</b>{" "}
                          {r.location === "기타" ? r.locationEtc : r.location}
                        </span>
                      )}
                      {r.industry && (
                        <span className={styles.infoTag}>
                          <b>업태</b>{" "}
                          {r.industry === "기타" ? r.industryEtc : r.industry}
                        </span>
                      )}
                      {r.purpose && (
                        <span className={styles.infoTag}>
                          <b>목적</b>{" "}
                          {r.purpose === "기타" ? r.purposeEtc : r.purpose}
                        </span>
                      )}
                      {r.visitRoute && (
                        <span className={styles.infoTag}>
                          <b>계기</b>{" "}
                          {r.visitRoute === "기타" ? r.visitRouteEtc : r.visitRoute}
                        </span>
                      )}
                    </div>
                    <div className={styles.ratingList}>
                      {SATISFACTION_ITEMS.map(({ key, label, commentKey }) => {
                        const score = r[key as keyof SurveyResult] as number;
                        const comment = r[commentKey as keyof SurveyResult] as string;
                        const sat = SATISFACTION_LABELS[score];
                        if (!score || !sat) return null;
                        return (
                          <div key={String(key)} className={styles.ratingRow}>
                            <span className={styles.ratingLabel}>{label}</span>
                            <span className={`${styles.ratingScore} ${sat.bad ? styles.ratingScoreBad : ""}`}>
                              {sat.text}
                            </span>
                            {comment && (
                              <span className={styles.ratingComment}>{comment}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {r.revisit && (
                      <div className={styles.comment}>
                        <span className={styles.commentLabel}>재방문</span>
                        <p className={styles.commentText}>
                          {REVISIT_LABELS[r.revisit] ?? r.revisit}
                        </p>
                      </div>
                    )}
                    {r.comment && (
                      <div className={styles.comment}>
                        <span className={styles.commentLabel}>자유 의견</span>
                        <p className={styles.commentText}>{r.comment}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
