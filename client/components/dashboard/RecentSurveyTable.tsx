import { RecentSurveyItem } from '@/types/dashboard';
import Link from 'next/link';
import styles from './RecentSurveyTable.module.css';

const SCORE_LABELS = ['', '매우불만족', '불만족', '보통', '만족', '매우만족'];
const SCORE_CLS = [styles.bd, styles.bd, styles.bd, styles.nm, styles.gd, styles.vg];

function ScoreBadge({ score }: { score: number }) {
  const label = SCORE_LABELS[score] ?? '-';
  const cls = SCORE_CLS[score] ?? styles.nm;
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

function RevisitBadge({ value }: { value: string | null }) {
  if (!value) return <span className={`${styles.badge} ${styles.rnm}`}>-</span>;
  const cls =
    value === '매우 그렇다' ? styles.rvg :
    value === '그렇다'      ? styles.rgd : styles.rnm;
  return <span className={`${styles.badge} ${cls}`}>{value}</span>;
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start) return '-';
  const s = start.slice(5).replace('-', '-');
  if (!end || end === start) return s;
  return `${s} ~ ${end.slice(5).replace('-', '-')}`;
}

function formatDate(iso: string) {
  return iso.slice(0, 10).slice(5).replace('-', '-');
}

interface Props {
  recentSurveys: RecentSurveyItem[];
}

export default function RecentSurveyTable({ recentSurveys }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>최근 설문 내역</span>
        <Link href="/survey" className={styles.viewAll}>전체 보기 →</Link>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>단체명</th>
              <th>담당자</th>
              <th>이용일</th>
              <th>응답일</th>
              <th>직원서비스</th>
              <th>청결</th>
              <th>시설</th>
              <th>식당</th>
              <th>비용</th>
              <th>재방문</th>
            </tr>
          </thead>
          <tbody>
            {recentSurveys.map((row) => (
              <tr key={row.id}>
                <td className={styles.tdOrg}>{row.organization ?? '-'}</td>
                <td className={styles.tdMuted}>{row.customer ?? '-'}</td>
                <td className={styles.tdMuted}>{formatPeriod(row.startDate, row.endDate)}</td>
                <td className={styles.tdMuted}>{formatDate(row.createdAt)}</td>
                <td><ScoreBadge score={row.staffService} /></td>
                <td><ScoreBadge score={row.cleanliness} /></td>
                <td><ScoreBadge score={row.facilities} /></td>
                <td><ScoreBadge score={row.cafeteria} /></td>
                <td><ScoreBadge score={row.pricing} /></td>
                <td><RevisitBadge value={row.revisit} /></td>
              </tr>
            ))}
            {recentSurveys.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '24px', opacity: 0.4 }}>
                  설문 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
