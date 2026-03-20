'use client';

import { useState, use } from 'react';
import { submitSurvey } from '@/lib/api/survey';
import { SurveyAnswers } from '@/types/survey';
import styles from './page.module.css';

interface Props {
  params: Promise<{ token: string }>;
}

const QUESTIONS: { key: keyof Omit<SurveyAnswers, 'comment'>; label: string; icon: string }[] = [
  { key: 'facility', label: '시설 만족도', icon: '🏢' },
  { key: 'meal', label: '식사 만족도', icon: '🍱' },
  { key: 'service', label: '서비스 만족도', icon: '👋' },
  { key: 'classroom', label: '강의실 만족도', icon: '📚' },
  { key: 'overall', label: '전체 만족도', icon: '⭐' },
];

const SCORE_LABELS = ['', '매우 불만족', '불만족', '보통', '만족', '매우 만족'];

const defaultAnswers: SurveyAnswers = {
  facility: 0,
  meal: 0,
  service: 0,
  classroom: 0,
  overall: 0,
  comment: '',
};

export default function SurveyPage({ params }: Props) {
  const { token } = use(params);
  const [answers, setAnswers] = useState<SurveyAnswers>(defaultAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setScore = (key: keyof Omit<SurveyAnswers, 'comment'>, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const allAnswered = QUESTIONS.every((q) => answers[q.key] > 0);

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('모든 항목을 선택해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await submitSurvey(token, JSON.stringify(answers));
      setSubmitted(true);
    } catch {
      setError('제출 중 오류가 발생했습니다. 이미 제출한 설문이거나 유효하지 않은 링크입니다.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>설문이 완료되었습니다</h2>
          <p className={styles.successDesc}>소중한 의견을 주셔서 감사합니다.<br />더 나은 서비스로 보답하겠습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.logo}>흥국생명 연수원</div>
          <h1 className={styles.title}>이용 만족도 설문</h1>
          <p className={styles.subtitle}>연수원을 이용해 주셔서 감사합니다.<br />서비스 개선을 위한 소중한 의견을 남겨주세요.</p>
        </div>

        <div className={styles.questions}>
          {QUESTIONS.map((q) => (
            <div key={q.key} className={styles.question}>
              <div className={styles.questionLabel}>
                <span className={styles.questionIcon}>{q.icon}</span>
                {q.label}
              </div>
              <div className={styles.scoreRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`${styles.scoreBtn} ${answers[q.key] === n ? styles.scoreBtnActive : ''}`}
                    onClick={() => setScore(q.key, n)}
                  >
                    <span className={styles.scoreStar}>★</span>
                    <span className={styles.scoreNum}>{n}</span>
                  </button>
                ))}
              </div>
              {answers[q.key] > 0 && (
                <div className={styles.scoreLabel}>{SCORE_LABELS[answers[q.key]]}</div>
              )}
            </div>
          ))}

          <div className={styles.question}>
            <div className={styles.questionLabel}>
              <span className={styles.questionIcon}>💬</span>
              자유 의견 (선택)
            </div>
            <textarea
              className={styles.textarea}
              placeholder="불편했던 점이나 개선 사항을 자유롭게 작성해 주세요."
              rows={4}
              value={answers.comment}
              onChange={(e) => setAnswers((prev) => ({ ...prev, comment: e.target.value }))}
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '제출 중...' : '설문 제출'}
        </button>
      </div>
    </div>
  );
}
