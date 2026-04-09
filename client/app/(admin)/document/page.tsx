'use client';

import { useEffect, useState, useCallback } from 'react';
import { searchReservations, downloadEstimate, downloadTrade, downloadConfirmation } from '@/lib/api/reservation';
import { Reservation } from '@/types/reservation';
import styles from './page.module.css';

const STATUS_COLOR: Record<string, string> = {
  확정: '#16a34a',
  예약: '#d97706',
  문의: '#6366f1',
  취소: '#ef4444',
};

const STATUS_OPTIONS = ['전체', '확정', '예약', '문의', '취소'];

const PAGE_SIZE = 15;

export default function DocumentPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [tradingId, setTradingId] = useState<number | null>(null);

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

  const handleTrade = async (id: number, org: string) => {
    setTradingId(id);
    try {
      await downloadTrade(id, org);
    } finally {
      setTradingId(null);
    }
  };

  const handleConfirmation = async (id: number, org: string) => {
    setConfirmingId(id);
    try {
      await downloadConfirmation(id, org);
    } finally {
      setConfirmingId(null);
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

  const handleStatusChange = (s: string) => {
    setStatus(s === '전체' ? '' : (status === s ? '' : s));
    setPage(0);
  };

  const handleReset = () => { setKeyword(''); setStatus(''); setStartDate(''); setEndDate(''); setPage(0); };

  return (
    <div className={styles.page}>
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>검색옵션</span>
          <div className={styles.statusCheckboxes}>
            {STATUS_OPTIONS.map((s) => (
              <label key={s} className={styles.statusCheckLabel}>
                <input
                  type="checkbox"
                  checked={s === '전체' ? status === '' : status === s}
                  onChange={() => handleStatusChange(s)}
                />
                {s}
              </label>
            ))}
          </div>
          <div className={styles.filterRowRight}>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className={styles.dateSep}>~</span>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {(keyword || status || startDate || endDate) && (
              <button className={styles.resetBtn} onClick={handleReset}>초기화</button>
            )}
          </div>
        </div>
        <div className={styles.filterDivider} />
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>검색명</span>
          <input
            className={styles.searchInput}
            placeholder="단체명 / 담당자를 입력하세요."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); fetchList(keyword, status, startDate, endDate, 0); } }}
          />
          <button className={styles.searchBtn} onClick={() => { setPage(0); fetchList(keyword, status, startDate, endDate, 0); }}>검색</button>
        </div>
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
                  <div className={styles.cardOrgBlock}>
                    <div className={styles.org}>{r.organization}</div>
                    <div className={styles.code}>{r.reservationCode}</div>
                  </div>
                  <div className={styles.cardDateBlock}>
                    <span className={styles.cardDateRange}>{String(r.startDate)} ~ {String(r.endDate)}</span>
                  </div>
                  <div className={styles.cardCustomerBlock}>
                    <span className={styles.cardFieldValue}>{r.customer}</span>
                    <span className={styles.cardFieldSub}>{r.customerPhone}</span>
                  </div>
                  <div className={styles.cardPurposeBlock}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: STATUS_COLOR[r.status] ?? '#888' }}
                    >
                      {r.status}
                    </span>
                    {r.people != null && <span className={styles.cardFieldSub}>{r.people}명</span>}
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
                  <button
                    className={styles.docBtn}
                    disabled={confirmingId === r.id}
                    onClick={() => handleConfirmation(r.id, r.organization)}
                  >
                    {confirmingId === r.id ? '생성 중...' : '확인서'}
                  </button>
                  <button
                    className={styles.docBtn}
                    disabled={tradingId === r.id}
                    onClick={() => handleTrade(r.id, r.organization)}
                  >
                    {tradingId === r.id ? '생성 중...' : '거래명세서'}
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
