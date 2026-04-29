'use client';

import SurveyCard from '@/components/survey/SurveyCard';
import SurveyStatsChart from '@/components/survey/SurveyStatsChart';
import { getAllSurveys } from '@/lib/api/survey';
import { SurveyResult } from '@/types/survey';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function SurveyPage() {
  const [surveys, setSurveys] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getAllSurveys()
      .then(setSurveys)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = query
    ? surveys.filter(
        (s) =>
          s.organization?.includes(query) ||
          s.customer?.includes(query) ||
          s.reservationId?.includes(query),
      )
    : surveys;

  return (
    <div className={styles.page}>
      <div className={styles.contentHeader}>
        <div>
          <div className={styles.contentTitle}>설문 결과</div>
          <div className={styles.contentSub}>설문이 완료된 예약의 응답을 확인합니다.</div>
        </div>
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="단체명 / 예약코드 / 담당자 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <SurveyStatsChart surveys={surveys} />

      <div className={styles.list}>
        {loading && (
          <div className={styles.empty}>불러오는 중...</div>
        )}
        {!loading && filtered.map((s) => (
          <SurveyCard key={s.id} data={s} />
        ))}
        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            {query ? '검색 결과가 없습니다.' : '등록된 설문 결과가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
}
