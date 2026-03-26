'use client';

import { useEffect, useState, useCallback } from 'react';
import { searchReservations, downloadEstimate } from '@/lib/api/reservation';
import { Reservation } from '@/types/reservation';
import styles from './page.module.css';

const STATUS_COLOR: Record<string, string> = {
  확정: '#2563eb',
  대기: '#f59e0b',
  취소: '#ef4444',
};

const PAGE_SIZE = 15;

export default function DocumentPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchList = useCallback(async (
    kw: string, st: string, sd: string, ed: string, pg: number
  ) => {
    setLoading(true);
    try {
      const result = await searchReservations({
        keyword: kw || undefined,
        status: st || undefined,
        startDate: sd || undefined,
        endDate: ed || undefined,
        page: pg,
        size: PAGE_SIZE,
        sort: 'startDate,desc',
      });
      setReservations(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } finally {
      setLoading(false);
    }
  }, []);

  // 검색 조건 변경 시 페이지 0으로 초기화
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchList(keyword, status, startDate, endDate, 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, status, startDate, endDate, fetchList]);

  // 페이지 변경 시
  useEffect(() => {
    fetchList(keyword, status, startDate, endDate, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleEstimate = async (id: number, org: string) => {
    setDownloadingId(id);
    try {
      await downloadEstimate(id, org);
    } finally {
      setDownloadingId(null);
    }
  };

  // 페이지 번호 배열 (최대 5개 표시)
  const pageNumbers = () => {
    const total = totalPages;
    const cur = page;
    const delta = 2;
    const start = Math.max(0, cur - delta);
    const end = Math.min(total - 1, cur + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>문서 관리</div>
          <div className={styles.subtitle}>
            총 {totalElements}건 · 예약별 견적서를 다운로드할 수 있습니다.
          </div>
        </div>
        <input
          className={styles.searchInput}
          placeholder="단체명·담당자 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="확정">확정</option>
          <option value="대기">대기</option>
          <option value="취소">취소</option>
        </select>
        <input
          type="date"
          className={styles.filterInput}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="시작일"
        />
        <span style={{ color: 'var(--text-sub)', fontSize: 13 }}>~</span>
        <input
          type="date"
          className={styles.filterInput}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="종료일"
        />
        {(keyword || status || startDate || endDate) && (
          <button
            className={styles.filterSelect}
            style={{ cursor: 'pointer', color: 'var(--text-sub)' }}
            onClick={() => { setKeyword(''); setStatus(''); setStartDate(''); setEndDate(''); }}
          >
            초기화
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.empty}>불러오는 중...</div>
      ) : reservations.length === 0 ? (
        <div className={styles.empty}>검색 결과가 없습니다.</div>
      ) : (
        <>
          <div className={styles.list}>
            {reservations.map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <div className={styles.dot} style={{ backgroundColor: r.colorCode }} />
                  <div>
                    <div className={styles.org}>{r.organization}</div>
                    <div className={styles.meta}>
                      <span className={styles.code}>{r.reservationCode}</span>
                      <span>{r.startDate} ~ {r.endDate}</span>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: STATUS_COLOR[r.status] ?? '#888' }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className={styles.info}>
                      <span>{r.customer}</span>
                      <span>{r.customerPhone}</span>
                      {r.people != null && <span>{r.people}명</span>}
                    </div>
                  </div>
                </div>
                <div className={styles.cardBtns}>
                  <button
                    className={styles.docBtn}
                    disabled={downloadingId === r.id}
                    onClick={() => handleEstimate(r.id, r.organization)}
                  >
                    {downloadingId === r.id ? '생성 중...' : '견적서'}
                  </button>
                  <button className={`${styles.docBtn} ${styles.soonBtn}`} disabled>
                    확인서
                  </button>
                  <button className={`${styles.docBtn} ${styles.soonBtn}`} disabled>
                    거래명세서
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage(0)}
            >
              «
            </button>
            <button
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              ‹
            </button>

            {pageNumbers().map((n) => (
              <button
                key={n}
                className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(n)}
              >
                {n + 1}
              </button>
            ))}

            <button
              className={styles.pageBtn}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              ›
            </button>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
            >
              »
            </button>

            <span className={styles.pageInfo}>
              {page + 1} / {totalPages || 1}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
