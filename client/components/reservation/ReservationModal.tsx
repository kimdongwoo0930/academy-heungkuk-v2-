'use client';

import { ClassroomReservation, MealReservation, Reservation, RoomReservation } from '@/types/reservation';
import { useState } from 'react';
// RoomReservation used in handleRoomConfirm type annotation
import { ROOM_INFO, RoomType } from '@/lib/constants/rooms';
import styles from './ReservationModal.module.css';
import RoomPickerModal from './RoomPickerModal';

const TABS = ['기본정보', '강의실', '숙박', '식수'] as const;
type Tab = typeof TABS[number];

const STATUS_OPTIONS = ['확정', '대기', '완료', '취소'];
const ROOM_TYPES: RoomType[] = ['1인실', '2인실', '4인실'];
const COLOR_PRESETS = [
  '#4A90E2', '#7ED321', '#F5A623', '#9B59B6',
  '#E74C3C', '#1ABC9C', '#E67E22', '#EC008C',
  '#2C3E50', '#27AE60', '#2980B9', '#8E44AD',
];

const CLASSROOM_OPTIONS = [
  '105', '201', '203', '204', '202', '103', '102',
  '106', '205', '206', 'A', 'B', '101', '107',
];

interface Props {
  reservation: Reservation | null;
  allReservations: Reservation[];
  onClose: () => void;
  onSave: (data: Reservation) => void | Promise<void>;
}

function emptyForm(): Omit<Reservation, 'id' | 'reservationCode'> {
  return {
    organization: '',
    purpose: '',
    people: 0,
    customer: '',
    customerPhone: '',
    customerPhone2: '',
    customerEmail: '',
    startDate: '',
    endDate: '',
    colorCode: '#4A90E2',
    status: '확정',
    memo: '',
    classrooms: [],
    rooms: [],
    meals: [],
  };
}

export default function ReservationModal({ reservation, allReservations, onClose, onSave }: Props) {
  const isEdit = reservation !== null;
  const [tab, setTab] = useState<Tab>('기본정보');
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState('');
  const [bulkClassroom, setBulkClassroom] = useState('105');
  const [bulkMeal, setBulkMeal] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [bulkRoomPickerOpen, setBulkRoomPickerOpen] = useState(false);
  const [form, setForm] = useState<Omit<Reservation, 'id' | 'reservationCode'>>(
    isEdit
      ? {
          organization: reservation.organization,
          purpose: reservation.purpose,
          people: reservation.people,
          customer: reservation.customer,
          customerPhone: reservation.customerPhone,
          customerPhone2: reservation.customerPhone2 ?? '',
          customerEmail: reservation.customerEmail ?? '',
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          colorCode: reservation.colorCode,
          status: reservation.status,
          memo: reservation.memo ?? '',
          classrooms: reservation.classrooms ? [...reservation.classrooms] : [],
          rooms: reservation.rooms ? [...reservation.rooms] : [],
          meals: reservation.meals ? [...reservation.meals] : [],
        }
      : emptyForm()
  );

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // --- 날짜 범위 생성 헬퍼 ---
  const buildDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const cur = new Date(start);
    const endD = new Date(end);
    while (cur <= endD) {
      dates.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const getDateRange = () => buildDateRange(form.startDate, form.endDate);

  // 숙박은 퇴실일(endDate) 제외
  const getRoomDateRange = () => {
    const dates = buildDateRange(form.startDate, form.endDate);
    return dates.slice(0, -1);
  };

  // --- 중복 체크 ---
  // 현재 편집 중인 예약을 제외한 다른 예약들
  const otherReservations = allReservations.filter((r) => r.id !== (isEdit ? reservation.id : -1));
  const otherClassrooms = otherReservations.flatMap((r) => r.classrooms ?? []);
  const otherRooms      = otherReservations.flatMap((r) => r.rooms ?? []);

  const isClassroomConflict = (c: ClassroomReservation) =>
    otherClassrooms.some((oc) => oc.classroomName === c.classroomName && oc.reservedDate === c.reservedDate);

  const isRoomConflict = (r: { roomNumber: string; reservedDate: string }) =>
    otherRooms.some((or) => or.roomNumber === r.roomNumber && or.reservedDate === r.reservedDate);

  // 특정 날짜에 다른 예약에서 이미 잡힌 호실 목록
  const getOccupiedRoomsForDate = (date: string) =>
    otherRooms.filter((r) => r.reservedDate === date).map((r) => r.roomNumber);

  // 날짜 + 강의실명이 겹치는 현재 form 내 중복
  const getClassroomInternalConflicts = () => {
    const seen = new Set<string>();
    return (form.classrooms ?? []).map((c) => {
      const key = `${c.classroomName}_${c.reservedDate}`;
      const dup = seen.has(key);
      seen.add(key);
      return dup;
    });
  };

  // --- 날짜 입력 핸들러 (유효성 검사 + 자동 생성) ---
  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    const start = key === 'startDate' ? value : form.startDate;
    const end   = key === 'endDate'   ? value : form.endDate;

    if (start && end && end < start) {
      setDateError('퇴실일은 입실일보다 빠를 수 없습니다.');
      setField(key, value);
      return;
    }
    setDateError('');

    if (start && end && end >= start) {
      const dates = buildDateRange(start, end);
      const classrooms: ClassroomReservation[] = dates.map((d) => ({ classroomName: bulkClassroom, reservedDate: d }));
      const meals: MealReservation[] = dates.map((d) => ({ reservedDate: d, breakfast: 0, lunch: 0, dinner: 0 }));
      setForm((prev) => ({ ...prev, [key]: value, classrooms, meals, rooms: [] }));
    } else {
      setField(key, value);
    }
  };

  // --- 강의실 ---
  const addClassroom = () =>
    setField('classrooms', [...(form.classrooms ?? []), { classroomName: '105', reservedDate: form.startDate || '' }]);
  const removeClassroom = (i: number) =>
    setField('classrooms', (form.classrooms ?? []).filter((_, idx) => idx !== i));
  const updateClassroom = (i: number, patch: Partial<ClassroomReservation>) =>
    setField('classrooms', (form.classrooms ?? []).map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const applyBulkClassroom = () => {
    const dates = getDateRange();
    setField('classrooms', dates.map((d) => ({ classroomName: bulkClassroom, reservedDate: d })));

  };

  // --- 숙박 ---

  // 특정 날짜에 선택된 호실 목록
  const getRoomsForDate = (date: string) =>
    (form.rooms ?? []).filter((r) => r.reservedDate === date).map((r) => r.roomNumber);

  // 날짜별 타입별 호실 수
  const countRoomsForDate = (date: string, type: RoomType) =>
    (form.rooms ?? []).filter((r) => r.reservedDate === date && ROOM_INFO[r.roomNumber]?.type === type).length;

  // 호실 선택 확인 (해당 날짜 기존 항목 교체)
  const handleRoomConfirm = (date: string, pickedRooms: string[]) => {
    const otherDates = (form.rooms ?? []).filter((r) => r.reservedDate !== date);
    const newEntries: RoomReservation[] = pickedRooms.map((num) => ({
      roomNumber: num,
      roomType: ROOM_INFO[num]?.type ?? '1인실',
      reservedDate: date,
    }));
    setField('rooms', [...otherDates, ...newEntries]);
    setPickerDate(null);
  };

  // 전체 날짜 일괄 호실 적용
  const applyBulkRooms = (pickedRooms: string[]) => {
    const dates = getRoomDateRange();
    const newEntries: RoomReservation[] = dates.flatMap((date) =>
      pickedRooms.map((num) => ({
        roomNumber: num,
        roomType: ROOM_INFO[num]?.type ?? '1인실',
        reservedDate: date,
      }))
    );
    setField('rooms', newEntries);
    setBulkRoomPickerOpen(false);
  };

  // --- 식수 ---
  const addMeal = () =>
    setField('meals', [...(form.meals ?? []), { reservedDate: form.startDate || '', breakfast: 0, lunch: 0, dinner: 0 }]);
  const removeMeal = (i: number) =>
    setField('meals', (form.meals ?? []).filter((_, idx) => idx !== i));
  const updateMeal = (i: number, patch: Partial<MealReservation>) =>
    setField('meals', (form.meals ?? []).map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const applyBulkMeal = () => {
    const dates = getDateRange();
    setField('meals', dates.map((d) => ({ reservedDate: d, ...bulkMeal })));
  };

  const handleSave = () => {
    if (!form.organization.trim()) { alert('단체명을 입력해주세요.'); setTab('기본정보'); return; }
    if (!form.customer.trim()) { alert('담당자를 입력해주세요.'); setTab('기본정보'); return; }
    if (!form.customerPhone.trim()) { alert('연락처를 입력해주세요.'); setTab('기본정보'); return; }
    if (!form.customerEmail?.trim()) { alert('이메일을 입력해주세요.'); setTab('기본정보'); return; }
    if (!form.startDate || !form.endDate) { alert('날짜를 입력해주세요.'); setTab('기본정보'); return; }
    if (dateError) { alert(dateError); setTab('기본정보'); return; }

    // 강의실 중복 체크
    const conflictedClassrooms = (form.classrooms ?? []).filter(isClassroomConflict);
    if (conflictedClassrooms.length > 0) {
      const list = conflictedClassrooms.map((c) => `${c.reservedDate} ${c.classroomName}호`).join('\n');
      alert(`다음 강의실이 이미 예약되어 있습니다:\n${list}\n\n강의실 탭에서 확인해주세요.`);
      setTab('강의실');
      return;
    }

    // 강의실 내부 중복 체크 (같은 날짜 + 같은 강의실 두 번)
    const internalDups = getClassroomInternalConflicts();
    if (internalDups.some(Boolean)) {
      const dupItems = (form.classrooms ?? []).filter((_, i) => internalDups[i]);
      const list = dupItems.map((c) => `${c.reservedDate} ${c.classroomName}호`).join('\n');
      alert(`같은 날짜에 동일한 강의실이 중복 입력되어 있습니다:\n${list}`);
      setTab('강의실');
      return;
    }

    // 숙박 호실 중복 체크
    const conflictedRooms = (form.rooms ?? []).filter(isRoomConflict);
    if (conflictedRooms.length > 0) {
      const list = conflictedRooms.map((r) => `${r.reservedDate} ${r.roomNumber}호`).join('\n');
      alert(`다음 호실이 이미 예약되어 있습니다:\n${list}\n\n숙박 탭에서 확인해주세요.`);
      setTab('숙박');
      return;
    }

    onSave({
      id: isEdit ? reservation.id : Date.now(),
      reservationCode: isEdit ? reservation.reservationCode : `HK-${Date.now()}`,
      ...form,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>{isEdit ? '예약 상세 / 수정' : '예약 등록'}</h3>
            <p className={styles.reqNote}><span className={styles.req}>*</span> 필수 입력 항목</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 탭 */}
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {/* 기본정보 */}
          {tab === '기본정보' && (
            <div className={styles.grid}>
              <label className={styles.label}><span>단체명 <span className={styles.req}>*</span></span>
                <input className={styles.input} value={form.organization} onChange={(e) => setField('organization', e.target.value)} placeholder="단체명" />
              </label>
              <label className={styles.label}>교육 목적
                <input className={styles.input} value={form.purpose} onChange={(e) => setField('purpose', e.target.value)} placeholder="교육 목적" />
              </label>
              <label className={styles.label}><span>인원 <span className={styles.req}>*</span></span>
                <input className={styles.input} type="number" value={form.people || ''} onChange={(e) => setField('people', Number(e.target.value))} placeholder="0" />
              </label>
              <label className={styles.label}>상태
                <select className={styles.select} value={form.status} onChange={(e) => setField('status', e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className={styles.label}><span>담당자 <span className={styles.req}>*</span></span>
                <input className={styles.input} value={form.customer} onChange={(e) => setField('customer', e.target.value)} placeholder="담당자명" />
              </label>
              <label className={styles.label}><span>연락처 <span className={styles.req}>*</span></span>
                <input className={styles.input} value={form.customerPhone} onChange={(e) => setField('customerPhone', e.target.value)} placeholder="010-0000-0000" />
              </label>
              <label className={styles.label}>연락처2
                <input className={styles.input} value={form.customerPhone2 ?? ''} onChange={(e) => setField('customerPhone2', e.target.value)} placeholder="(선택)" />
              </label>
              <label className={styles.label}><span>이메일 <span className={styles.req}>*</span></span>
                <input className={styles.input} value={form.customerEmail ?? ''} onChange={(e) => setField('customerEmail', e.target.value)} placeholder="이메일" />
              </label>
              <label className={styles.label}><span>입실일 <span className={styles.req}>*</span></span>
                <input className={styles.input} type="date" value={form.startDate} onChange={(e) => handleDateChange('startDate', e.target.value)} />
              </label>
              <label className={styles.label}><span>퇴실일 <span className={styles.req}>*</span></span>
                <input className={`${styles.input} ${dateError ? styles.inputError : ''}`} type="date" value={form.endDate} onChange={(e) => handleDateChange('endDate', e.target.value)} />
              </label>
              {dateError && <p className={`${styles.dateError} ${styles.fullWidth}`}>{dateError}</p>}
              <label className={`${styles.label} ${styles.fullWidth}`}>색상
                <div className={styles.colorRow}>
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      className={`${styles.colorSwatch} ${form.colorCode === c ? styles.colorSelected : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setField('colorCode', c)}
                    />
                  ))}
                </div>
              </label>
              <label className={`${styles.label} ${styles.fullWidth}`}>메모
                <textarea className={styles.textarea} value={form.memo ?? ''} onChange={(e) => setField('memo', e.target.value)} rows={3} placeholder="특이사항 메모" />
              </label>
            </div>
          )}

          {/* 강의실 */}
          {tab === '강의실' && (
            <div>
              {/* 전체 설정 */}
              <div className={styles.bulkRow}>
                <span className={styles.bulkLabel}>전체 날짜 일괄 적용</span>
                <select className={styles.cellSelect} value={bulkClassroom} onChange={(e) => setBulkClassroom(e.target.value)}>
                  {CLASSROOM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <button className={styles.applyBtn} onClick={applyBulkClassroom}>전체 적용</button>
              </div>
              <div className={styles.listHeader}>
                <span className={styles.listCount}>총 {(form.classrooms ?? []).length}건</span>
                <button className={styles.addRowBtn} onClick={addClassroom}>+ 추가</button>
              </div>
              {(form.classrooms ?? []).length === 0 ? (
                <p className={styles.empty}>강의실 배정 내역이 없습니다.</p>
              ) : (
                <table className={styles.listTable}>
                  <thead>
                    <tr><th>강의실</th><th>날짜</th><th>상태</th><th></th></tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const internalDups = getClassroomInternalConflicts();
                      return (form.classrooms ?? []).map((c, i) => {
                        const extConflict = isClassroomConflict(c);
                        const intConflict = internalDups[i];
                        const hasConflict = extConflict || intConflict;
                        return (
                          <tr key={i} className={hasConflict ? styles.conflictRow : ''}>
                            <td>
                              <select className={styles.cellSelect} value={c.classroomName} onChange={(e) => updateClassroom(i, { classroomName: e.target.value })}>
                                {CLASSROOM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </td>
                            <td>
                              <input className={styles.cellInput} type="date" value={c.reservedDate} onChange={(e) => updateClassroom(i, { reservedDate: e.target.value })} />
                            </td>
                            <td>
                              {hasConflict && (
                                <span className={styles.conflictBadge} title={extConflict ? '다른 예약과 중복' : '내부 중복'}>
                                  ⚠ {extConflict ? '중복' : '내부중복'}
                                </span>
                              )}
                            </td>
                            <td><button className={styles.removeBtn} onClick={() => removeClassroom(i)}>✕</button></td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 숙박 */}
          {tab === '숙박' && (
            <div>
              {!form.startDate || !form.endDate ? (
                <p className={styles.empty}>기본정보 탭에서 입실일·퇴실일을 먼저 입력해주세요.</p>
              ) : (
                <>
                  <div className={styles.bulkRow}>
                    <span className={styles.bulkLabel}>전체 날짜 일괄 적용</span>
                    <button className={styles.applyBtn} onClick={() => setBulkRoomPickerOpen(true)}>호실 일괄 지정</button>
                  </div>
                  <table className={styles.listTable}>
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>1인실</th>
                        <th>2인실</th>
                        <th>4인실</th>
                        <th>합계</th>
                        <th>호실 지정</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRoomDateRange().map((date) => {
                        const total = (form.rooms ?? []).filter((r) => r.reservedDate === date).length;
                        const roomsForDate = (form.rooms ?? []).filter((r) => r.reservedDate === date);
                        const conflictCount = roomsForDate.filter(isRoomConflict).length;
                        return (
                          <tr key={date} className={conflictCount > 0 ? styles.conflictRow : ''}>
                            <td style={{ fontWeight: 600 }}>{date}</td>
                            {ROOM_TYPES.map((type) => (
                              <td key={type} className={styles.countCell}>
                                {countRoomsForDate(date, type) > 0
                                  ? <span className={styles.roomCountBadge}>{countRoomsForDate(date, type)}</span>
                                  : <span className={styles.zeroCount}>-</span>}
                              </td>
                            ))}
                            <td className={styles.countCell}>
                              {total > 0 ? <strong>{total}</strong> : '-'}
                              {conflictCount > 0 && <span className={styles.conflictBadge} title="중복 호실 있음"> ⚠ {conflictCount}개 중복</span>}
                            </td>
                            <td>
                              <button className={styles.pickBtn} onClick={() => setPickerDate(date)}>
                                호실 지정
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {/* 식수 */}
          {tab === '식수' && (
            <div>
              {/* 전체 설정 */}
              <div className={styles.bulkRow}>
                <span className={styles.bulkLabel}>전체 날짜 일괄 적용</span>
                <label className={styles.bulkMealLabel}>조식
                  <input className={styles.bulkInputSm} type="number" min={0} value={bulkMeal.breakfast || ''} onChange={(e) => setBulkMeal((p) => ({ ...p, breakfast: Number(e.target.value) }))} placeholder="0" />
                </label>
                <label className={styles.bulkMealLabel}>중식
                  <input className={styles.bulkInputSm} type="number" min={0} value={bulkMeal.lunch || ''} onChange={(e) => setBulkMeal((p) => ({ ...p, lunch: Number(e.target.value) }))} placeholder="0" />
                </label>
                <label className={styles.bulkMealLabel}>석식
                  <input className={styles.bulkInputSm} type="number" min={0} value={bulkMeal.dinner || ''} onChange={(e) => setBulkMeal((p) => ({ ...p, dinner: Number(e.target.value) }))} placeholder="0" />
                </label>
                <button className={styles.applyBtn} onClick={applyBulkMeal}>전체 적용</button>
              </div>
              <div className={styles.listHeader}>
                <span className={styles.listCount}>총 {(form.meals ?? []).length}건</span>
                <button className={styles.addRowBtn} onClick={addMeal}>+ 추가</button>
              </div>
              {(form.meals ?? []).length === 0 ? (
                <p className={styles.empty}>식수 내역이 없습니다.</p>
              ) : (
                <table className={styles.listTable}>
                  <thead>
                    <tr><th>날짜</th><th>조식</th><th>중식</th><th>석식</th><th></th></tr>
                  </thead>
                  <tbody>
                    {(form.meals ?? []).map((m, i) => (
                      <tr key={i}>
                        <td>
                          <input className={styles.cellInput} type="date" value={m.reservedDate} onChange={(e) => updateMeal(i, { reservedDate: e.target.value })} />
                        </td>
                        <td>
                          <input className={styles.cellInputSm} type="number" value={m.breakfast || ''} onChange={(e) => updateMeal(i, { breakfast: Number(e.target.value) })} placeholder="0" />
                        </td>
                        <td>
                          <input className={styles.cellInputSm} type="number" value={m.lunch || ''} onChange={(e) => updateMeal(i, { lunch: Number(e.target.value) })} placeholder="0" />
                        </td>
                        <td>
                          <input className={styles.cellInputSm} type="number" value={m.dinner || ''} onChange={(e) => updateMeal(i, { dinner: Number(e.target.value) })} placeholder="0" />
                        </td>
                        <td><button className={styles.removeBtn} onClick={() => removeMeal(i)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button className={styles.saveBtn} onClick={handleSave}>저장</button>
        </div>
      </div>

      {/* 호실 선택 도면 모달 */}
      {pickerDate && (
        <RoomPickerModal
          date={pickerDate}
          selected={getRoomsForDate(pickerDate)}
          occupiedRooms={getOccupiedRoomsForDate(pickerDate)}
          onConfirm={(rooms) => handleRoomConfirm(pickerDate, rooms)}
          onClose={() => setPickerDate(null)}
        />
      )}

      {/* 일괄 호실 지정 모달 */}
      {bulkRoomPickerOpen && (
        <RoomPickerModal
          date="전체 날짜"
          selected={getRoomsForDate(getRoomDateRange()[0] ?? '')}
          occupiedRooms={[]}
          onConfirm={applyBulkRooms}
          onClose={() => setBulkRoomPickerOpen(false)}
        />
      )}
    </div>
  );
}
