'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/types/reservation';
import { getReservations, createReservation, updateReservation, toRequestBody } from '@/lib/api/reservation';
import ReservationModal from '@/components/reservation/ReservationModal';
import SurveyModal from '@/components/reservation/SurveyModal';
import styles from './page.module.css';

const STATUS_OPTIONS = ['전체', '확정', '대기', '완료', '취소'];

export default function ReservationPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('전체');
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [surveyTarget, setSurveyTarget] = useState<Reservation | null>(null);

  const fetchReservations = () =>
    getReservations()
      .then(setReservations)
      .catch(() => alert('예약 목록을 불러오는데 실패했습니다.'));

  useEffect(() => {
    fetchReservations().finally(() => setLoading(false));
  }, []);

  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.organization.includes(search) ||
      r.customer.includes(search) ||
      r.reservationCode.includes(search);
    const matchStatus = status === '전체' || r.status === status;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setSelected(null);
    setIsModalOpen(true);
  };

  const openEdit = (r: Reservation) => {
    setSelected(r);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Reservation) => {
    try {
      const body = toRequestBody(data);
      if (selected !== null) {
        await updateReservation(selected.id, body);
      } else {
        await createReservation(body);
      }
      setIsModalOpen(false);
      await fetchReservations();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      alert(status === 403 ? '수정 권한이 없습니다.' : '저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>예약 관리</h2>
        <button className={styles.addBtn} onClick={openCreate}>+ 예약 등록</button>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="단체명 / 담당자 / 예약코드 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.statusSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className={styles.countLabel}>총 {filtered.length}건</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>예약코드</th>
              <th>단체명</th>
              <th>목적</th>
              <th>인원</th>
              <th>담당자</th>
              <th>연락처</th>
              <th>입실일</th>
              <th>퇴실일</th>
              <th>상태</th>
              <th>설문</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '40px' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '40px' }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} onClick={() => openEdit(r)}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.reservationCode}</td>
                  <td>
                    <span className={styles.colorDot} style={{ backgroundColor: r.colorCode }} />
                    {r.organization}
                  </td>
                  <td>{r.purpose}</td>
                  <td>{r.people}명</td>
                  <td>{r.customer}</td>
                  <td>{r.customerPhone}</td>
                  <td>{String(r.startDate)}</td>
                  <td>{String(r.endDate)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[r.status]}`}>{r.status}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className={styles.surveyBtn}
                      onClick={() => setSurveyTarget(r)}
                    >
                      설문
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ReservationModal
          reservation={selected}
          allReservations={reservations}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {surveyTarget && (
        <SurveyModal
          reservationCode={surveyTarget.reservationCode}
          organization={surveyTarget.organization}
          onClose={() => setSurveyTarget(null)}
        />
      )}
    </div>
  );
}
