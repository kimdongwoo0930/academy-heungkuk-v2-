'use client';

import { useState, use } from 'react';
import { submitSurvey } from '@/lib/api/survey';
import { SurveyAnswers } from '@/types/survey';
import styles from './page.module.css';

interface Props {
  params: Promise<{ token: string }>;
}

const TOTAL_STEPS = 3;

const LOCATIONS = ['서울', '판교', '분당', '수원', '용인', '화성', '경기북부', '경기남부', '기타'];
const INDUSTRIES = [
  '제조업', '도매 및 소매업', '건설업', '금융 및 보험업', '부동산업',
  '전문, 과학기술 서비스업', '정보통신업', '교육서비스업', '협회 및 단체', '기타',
];
const PURPOSES = [
  '경영전략 워크숍', '정기 워크숍', '리더십 등 직원 역량강화 교육',
  '세일즈 및 트레이닝 교육', '신입 오리엔테이션', '기타',
];
const VISIT_ROUTES = ['홈페이지/인터넷', '지인 추천', '과거이용경험', '기타'];
const SATISFACTION_LABELS = ['매우 만족', '만족', '보통', '불만족', '매우 불만족'];
const REVISIT_OPTIONS = [
  '매우 그렇다',
  '그렇다',
  '불만사항이 개선될 경우 검토가 가능하다',
  '재방문 의향이 없다',
];

const SATISFACTION_QUESTIONS: {
  key: keyof Pick<SurveyAnswers, 'staffService' | 'cleanliness' | 'facilities' | 'cafeteria' | 'pricing'>;
  commentKey: keyof Pick<SurveyAnswers, 'staffServiceComment' | 'cleanlinessComment' | 'facilitiesComment' | 'cafeteriaComment' | 'pricingComment'>;
  label: string;
}[] = [
  { key: 'staffService', commentKey: 'staffServiceComment', label: '5. 연수원 직원의 서비스는 어느 정도 만족하셨습니까?' },
  { key: 'cleanliness', commentKey: 'cleanlinessComment', label: '6. 강의장, 객실, 기타 편의시설의 청결상태는 어느 정도 만족하셨습니까?' },
  { key: 'facilities', commentKey: 'facilitiesComment', label: '7. 강의장, 객실, 편의시설의 시설(빔프로젝트/방송장비/침대/화장실/주차장 등)은 어느 정도 만족하셨습니까?' },
  { key: 'cafeteria', commentKey: 'cafeteriaComment', label: '8. 구내식당의 음식 및 서비스는 어느 정도 만족하셨습니까?' },
  { key: 'pricing', commentKey: 'pricingComment', label: '9. 강의실, 객실, 구내식당, 기타 편의시설의 이용 비용은 어느 정도 만족하셨습니까?' },
];

const defaultAnswers: SurveyAnswers = {
  location: '', locationEtc: '',
  industry: '', industryEtc: '',
  purpose: '', purposeEtc: '',
  visitRoute: '', visitRouteEtc: '',
  staffService: 0, staffServiceComment: '',
  cleanliness: 0, cleanlinessComment: '',
  facilities: 0, facilitiesComment: '',
  cafeteria: 0, cafeteriaComment: '',
  pricing: 0, pricingComment: '',
  revisit: '', revisitComment: '',
  comment: '',
};

export default function SurveyPage({ params }: Props) {
  const { token } = use(params);
  const [answers, setAnswers] = useState<SurveyAnswers>(defaultAnswers);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof SurveyAnswers>(key: K, value: SurveyAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep = (): string => {
    if (step === 1) {
      if (!answers.location) return '회사(단체) 위치를 선택해주세요.';
      if (answers.location === '기타' && !answers.locationEtc.trim()) return '기타 위치를 입력해주세요.';
      if (!answers.industry) return '업태를 선택해주세요.';
      if (answers.industry === '기타' && !answers.industryEtc.trim()) return '기타 업태를 입력해주세요.';
      if (!answers.purpose) return '연수 목적을 선택해주세요.';
      if (answers.purpose === '기타' && !answers.purposeEtc.trim()) return '기타 연수 목적을 입력해주세요.';
      if (!answers.visitRoute) return '이용 계기를 선택해주세요.';
      if (answers.visitRoute === '기타' && !answers.visitRouteEtc.trim()) return '기타 이용 계기를 입력해주세요.';
    }
    if (step === 2) {
      for (const q of SATISFACTION_QUESTIONS) {
        if (!answers[q.key]) return '모든 만족도 항목을 선택해주세요.';
      }
    }
    if (step === 3) {
      if (!answers.revisit) return '재방문 의향을 선택해주세요.';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setError('');
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
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
          <p className={styles.successDesc}>
            소중한 의견을 주셔서 감사합니다.<br />더 나은 서비스로 보답하겠습니다.
          </p>
        </div>
      </div>
    );
  }

  const stepTitles = ['기본 정보', '만족도 평가', '종합 의견'];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.logo}>흥국생명 연수원</div>
          <h1 className={styles.title}>이용 만족도 설문</h1>
          <p className={styles.subtitle}>
            연수원을 이용해 주셔서 감사합니다.<br />서비스 개선을 위한 소중한 의견을 남겨주세요.
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className={styles.stepIndicator}>
          <div className={styles.stepTrack}>
            {[1, 2, 3].map((s) => (
              <div key={s} className={styles.stepItem}>
                <div className={`${styles.stepDot} ${s === step ? styles.stepDotActive : ''} ${s < step ? styles.stepDotDone : ''}`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && <div className={`${styles.stepLine} ${s < step ? styles.stepLineDone : ''}`} />}
              </div>
            ))}
          </div>
          <div className={styles.stepLabel}>{stepTitles[step - 1]} ({step}/{TOTAL_STEPS})</div>
        </div>

        <div className={styles.questions}>
          {/* ===== 1단계: 기본 정보 ===== */}
          {step === 1 && (
            <>
              <RadioQuestion
                label="1. 고객님의 회사(단체)는 어디에 있습니까?"
                name="location"
                options={LOCATIONS}
                value={answers.location}
                onChange={(v) => set('location', v)}
                etcValue={answers.locationEtc}
                onEtcChange={(v) => set('locationEtc', v)}
              />
              <RadioQuestion
                label="2. 고객님의 회사(단체)의 업태는?"
                name="industry"
                options={INDUSTRIES}
                value={answers.industry}
                onChange={(v) => set('industry', v)}
                etcValue={answers.industryEtc}
                onEtcChange={(v) => set('industryEtc', v)}
              />
              <RadioQuestion
                label="3. 고객님의 연수 목적은?"
                name="purpose"
                options={PURPOSES}
                value={answers.purpose}
                onChange={(v) => set('purpose', v)}
                etcValue={answers.purposeEtc}
                onEtcChange={(v) => set('purposeEtc', v)}
              />
              <RadioQuestion
                label="4. 흥국생명연수원을 이용하게 된 계기는 무엇입니까?"
                name="visitRoute"
                options={VISIT_ROUTES}
                value={answers.visitRoute}
                onChange={(v) => set('visitRoute', v)}
                etcValue={answers.visitRouteEtc}
                onEtcChange={(v) => set('visitRouteEtc', v)}
              />
            </>
          )}

          {/* ===== 2단계: 만족도 평가 ===== */}
          {step === 2 && SATISFACTION_QUESTIONS.map((q) => (
            <SatisfactionQuestion
              key={q.key}
              label={q.label}
              value={answers[q.key] as number}
              onChange={(v) => set(q.key, v)}
              commentValue={answers[q.commentKey] as string}
              onCommentChange={(v) => set(q.commentKey, v)}
            />
          ))}

          {/* ===== 3단계: 종합 의견 ===== */}
          {step === 3 && (
            <>
              <div className={styles.question}>
                <div className={styles.questionLabel}>
                  10. 귀 사(단체)에서 흥국생명연수원을 재방문하실 의향이 있으십니까?
                </div>
                <div className={styles.radioGroup}>
                  {REVISIT_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`${styles.radioOption} ${answers.revisit === opt ? styles.radioOptionActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="revisit"
                        value={opt}
                        checked={answers.revisit === opt}
                        onChange={() => set('revisit', opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {(answers.revisit === '불만사항이 개선될 경우 검토가 가능하다' || answers.revisit === '재방문 의향이 없다') && (
                  <textarea
                    className={styles.textarea}
                    placeholder="※ 불만족 내용을 입력해주세요."
                    rows={2}
                    value={answers.revisitComment}
                    onChange={(e) => set('revisitComment', e.target.value)}
                  />
                )}
              </div>

              <div className={styles.question}>
                <div className={styles.questionLabel}>
                  11. 귀하께서는 흥국생명연수원에 대해 그 밖에 느낀 점이 있으시면 작성해주시기 바랍니다
                </div>
                <textarea
                  className={styles.textarea}
                  placeholder="자유롭게 의견을 남겨주세요. (선택)"
                  rows={4}
                  value={answers.comment}
                  onChange={(e) => set('comment', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.btnRow}>
          {step > 1 && (
            <button className={styles.prevBtn} onClick={handlePrev}>이전</button>
          )}
          {step < TOTAL_STEPS ? (
            <button className={styles.nextBtn} onClick={handleNext}>다음</button>
          ) : (
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
              {loading ? '제출 중...' : '설문 제출'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 라디오 질문 컴포넌트 ────────────────────────────────────────────────────

interface RadioQuestionProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  etcValue?: string;
  onEtcChange?: (v: string) => void;
}

function RadioQuestion({ label, name, options, value, onChange, etcValue, onEtcChange }: RadioQuestionProps) {
  return (
    <div className={styles.question}>
      <div className={styles.questionLabel}>{label}</div>
      <div className={styles.radioGroup}>
        {options.map((opt) => (
          <label
            key={opt}
            className={`${styles.radioOption} ${value === opt ? styles.radioOptionActive : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
      {value === '기타' && onEtcChange && (
        <input
          className={styles.etcInput}
          type="text"
          placeholder="직접 입력해주세요"
          value={etcValue ?? ''}
          onChange={(e) => onEtcChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ─── 만족도 질문 컴포넌트 ────────────────────────────────────────────────────

interface SatisfactionQuestionProps {
  label: string;
  value: number; // 1=매우만족 ~ 5=매우불만족
  onChange: (v: number) => void;
  commentValue: string;
  onCommentChange: (v: string) => void;
}

function SatisfactionQuestion({ label, value, onChange, commentValue, onCommentChange }: SatisfactionQuestionProps) {
  const showComment = value >= 4;
  return (
    <div className={styles.question}>
      <div className={styles.questionLabel}>{label}</div>
      <div className={styles.satisfactionRow}>
        {SATISFACTION_LABELS.map((s, i) => (
          <button
            key={s}
            className={`${styles.satisfactionBtn} ${value === i + 1 ? styles.satisfactionBtnActive : ''} ${value === i + 1 && i >= 3 ? styles.satisfactionBtnBad : ''}`}
            onClick={() => onChange(i + 1)}
          >
            {s}
          </button>
        ))}
      </div>
      {showComment && (
        <textarea
          className={styles.textarea}
          placeholder="※ 불만족 내용을 입력해주세요."
          rows={2}
          value={commentValue}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      )}
    </div>
  );
}
