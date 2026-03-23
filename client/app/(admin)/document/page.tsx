'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Reservation } from '@/types/reservation';
import { getReservations, getReservationById } from '@/lib/api/reservation';
import { isAdmin } from '@/lib/utils/auth';
import QuotePreviewModal from '@/components/document/QuotePreviewModal';
import styles from './page.module.css';

const STATUS_COLOR: Record<string, string> = {
  확정: '#27AE60',
  예약: '#F39C12',
  취소: '#E74C3C',
};

export default function DocumentPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quoteTarget, setQuoteTarget] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/scheduler');
    }
  }, [router]);
  const [quoteLoading, setQuoteLoading] = useState(false);

  async function openQuote(id: number) {
    setQuoteLoading(true);
    try {
      const detail = await getReservationById(id);
      setQuoteTarget(detail);
    } catch {
      alert('견적서 데이터를 불러오는데 실패했습니다.');
    } finally {
      setQuoteLoading(false);
    }
  }

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch(() => alert('예약 목록을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reservations.filter(r =>
    r.organization.includes(search) ||
    r.customer.includes(search) ||
    (r.reservationCode ?? '').includes(search),
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>문서 관리</h1>
          <p className={styles.subtitle}>예약 건별 견적서·확인서·거래명세서를 생성합니다.</p>
        </div>
        <input
          className={styles.searchInput}
          placeholder="단체명, 담당자, 예약코드 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.empty}>불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>예약 내역이 없습니다.</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(r => (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <span className={styles.dot} style={{ background: r.colorCode }} />
                <div>
                  <div className={styles.org}>{r.organization}</div>
                  <div className={styles.meta}>
                    {r.startDate} ~ {r.endDate}
                    {r.reservationCode && (
                      <span className={styles.code}>{r.reservationCode}</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    {r.customer} · {r.customerPhone}
                    <span
                      className={styles.statusBadge}
                      style={{ background: STATUS_COLOR[r.status] ?? '#999' }}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.cardBtns}>
                <button
                  className={styles.docBtn}
                  onClick={() => openQuote(r.id)}
                  disabled={quoteLoading}
                >
                  {quoteLoading ? '로딩...' : '📄 견적서'}
                </button>
                <button
                  className={`${styles.docBtn} ${styles.soonBtn}`}
                  disabled
                  title="준비중"
                >
                  📋 확인서
                </button>
                <button
                  className={`${styles.docBtn} ${styles.soonBtn}`}
                  disabled
                  title="준비중"
                >
                  🧾 거래명세서
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {quoteTarget && (
        <QuotePreviewModal
          reservation={quoteTarget}
          onClose={() => setQuoteTarget(null)}
        />
      )}
    </div>
  );
}
