"use client";

import {
  ClassroomReservation,
  MealReservation,
  Reservation,
  RoomReservation,
} from "@/types/reservation";
import { useRef, useState } from "react";
// RoomReservation used in handleRoomConfirm type annotation
import { CLASSROOM_ROOM_TO_CATEGORY } from "@/lib/constants/classrooms";
import { ROOM_INFO, RoomType } from "@/lib/constants/rooms";
import { downloadEstimate, downloadTrade } from "@/lib/api/reservation";
import styles from "./ReservationModal.module.css";
import RoomPickerModal from "./RoomPickerModal";

const TABS = ["기본정보", "강의실", "숙박", "식수"] as const;
type Tab = (typeof TABS)[number];

const STATUS_OPTIONS = ["확정", "예약", "문의", "취소"];
const ROOM_TYPES: RoomType[] = ["1인실", "2인실", "4인실"];
const COLOR_PRESETS = [
  "#E0E0E0",
  "#BDBDBD",
  "#757575",
  "#4A90E2",
  "#0097A7",
  "#00897B",
  "#27AE60",
  "#F9C800",
  "#F5A623",
  "#E67E22",
  "#FF7043",
  "#E53935",
  "#EC008C",
  "#9B59B6",
  "#1ABC9C",
  "#F06292",
  "#795548",
  "#546E7A",
  "#7986CB",
  "#FF8A65",
  "#212121",
];

const CLASSROOM_OPTIONS = [
  "101",
  "102",
  "103",
  "105",
  "106",
  "107",
  "201",
  "202",
  "203",
  "204",
  "205",
  "206",
  "A",
  "B",
];

function classroomLabel(id: string) {
  const displayId = /^\d+$/.test(id) ? `${id}호` : id;
  const cat = CLASSROOM_ROOM_TO_CATEGORY[id];
  if (!cat) return displayId;
  const capacity = cat.match(/\d+인/)?.[0] ?? cat;
  return `${displayId} (${capacity})`;
}

interface Props {
  reservation: Reservation | null;
  allReservations: Reservation[];
  onClose: () => void;
  onSave: (data: Reservation) => void | Promise<void>;
  defaultValues?: Partial<Omit<Reservation, "id" | "reservationCode">>;
}

function emptyForm(): Omit<Reservation, "id" | "reservationCode"> {
  return {
    organization: "",
    purpose: "",
    people: 0,
    customer: "",
    customerPhone: "",
    customerPhone2: "",
    customerEmail: "",
    startDate: "",
    endDate: "",
    colorCode: "#4A90E2",
    status: "문의",
    companyAddress: "",
    siteManager: "",
    siteManagerPhone: "",
    memo: "",
    classrooms: [],
    rooms: [],
    meals: [],
  };
}

export default function ReservationModal({
  reservation,
  allReservations,
  onClose,
  onSave,
  defaultValues,
}: Props) {
  const isEdit = reservation !== null;
  const [saving, setSaving] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [trading, setTrading] = useState(false);

  // 드래그
  const [pos, setPos] = useState({ dx: 0, dy: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    dx: number;
    dy: number;
  } | null>(null);
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return; // 닫기 버튼 클릭 무시
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      dx: pos.dx,
      dy: pos.dy,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        dx: dragRef.current.dx + ev.clientX - dragRef.current.startX,
        dy: dragRef.current.dy + ev.clientY - dragRef.current.startY,
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const t = e.touches[0];
    dragRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      dx: pos.dx,
      dy: pos.dy,
    };
    const onMove = (ev: TouchEvent) => {
      if (!dragRef.current) return;
      const touch = ev.touches[0];
      setPos({
        dx: dragRef.current.dx + touch.clientX - dragRef.current.startX,
        dy: dragRef.current.dy + touch.clientY - dragRef.current.startY,
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onUp);
  };
  const [tab, setTab] = useState<Tab>("기본정보");
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState("");
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [bulkClassrooms, setBulkClassrooms] = useState<string[]>([""]);
  const [bulkMeal, setBulkMeal] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });
  const [bulkRoomPickerOpen, setBulkRoomPickerOpen] = useState(false);
  const [roomDates, setRoomDates] = useState<string[]>(() => {
    const buildRange = (start: string, end: string) => {
      const dates: string[] = [];
      const cur = new Date(start);
      const endD = new Date(end);
      while (cur < endD) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
      return dates;
    };
    if (isEdit) {
      const rooms = reservation.rooms ?? [];
      if (rooms.length > 0) {
        return [...new Set(rooms.map((r) => r.reservedDate))].sort();
      }
      if (reservation.startDate && reservation.endDate) {
        return buildRange(String(reservation.startDate), String(reservation.endDate));
      }
    } else if (defaultValues?.startDate && defaultValues?.endDate) {
      return buildRange(defaultValues.startDate, defaultValues.endDate);
    }
    return [];
  });
  const [showLoad, setShowLoad] = useState(false);
  const [loadSearch, setLoadSearch] = useState("");
  const [form, setForm] = useState<Omit<Reservation, "id" | "reservationCode">>(
    isEdit
      ? {
          organization: reservation.organization,
          purpose: reservation.purpose,
          people: reservation.people,
          customer: reservation.customer,
          customerPhone: reservation.customerPhone,
          customerPhone2: reservation.customerPhone2 ?? "",
          customerEmail: reservation.customerEmail ?? "",
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          colorCode: reservation.colorCode,
          status: reservation.status,
          companyAddress: reservation.companyAddress ?? "",
          siteManager: reservation.siteManager ?? "",
          siteManagerPhone: reservation.siteManagerPhone ?? "",
          memo: reservation.memo ?? "",
          classrooms: reservation.classrooms ? [...reservation.classrooms] : [],
          rooms: reservation.rooms ? [...reservation.rooms] : [],
          meals: reservation.meals ? [...reservation.meals] : [],
        }
      : { ...emptyForm(), ...defaultValues },
  );

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 불러오기: 단체명으로 필터링 후 가장 최근 예약 1건씩
  const loadCandidates = (() => {
    const q = loadSearch.trim();
    const filtered = allReservations.filter(
      (r) => r.organization.includes(q) || r.customer.includes(q),
    );
    // 단체명별로 가장 최근 예약만
    const map = new Map<string, Reservation>();
    [...filtered]
      .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)))
      .forEach((r) => {
        if (!map.has(r.organization)) map.set(r.organization, r);
      });
    return Array.from(map.values()).slice(0, 6);
  })();

  const applyLoad = (r: Reservation) => {
    setForm((prev) => ({
      ...prev,
      organization: r.organization,
      purpose: r.purpose,
      customer: r.customer,
      customerPhone: r.customerPhone,
      customerPhone2: r.customerPhone2 ?? "",
      customerEmail: r.customerEmail ?? "",
      colorCode: r.colorCode,
    }));
    setShowLoad(false);
    setLoadSearch("");
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
  const otherReservations = allReservations.filter(
    (r) => r.id !== (isEdit ? reservation.id : -1) && r.status !== "취소",
  );
  const otherClassrooms = otherReservations.flatMap((r) => r.classrooms ?? []);
  const otherRooms = otherReservations.flatMap((r) => r.rooms ?? []);

  const isClassroomConflict = (c: ClassroomReservation) =>
    otherClassrooms.some(
      (oc) =>
        oc.classroomName === c.classroomName &&
        oc.reservedDate === c.reservedDate,
    );

  const isRoomConflict = (r: { roomNumber: string; reservedDate: string }) =>
    otherRooms.some(
      (or) =>
        or.roomNumber === r.roomNumber && or.reservedDate === r.reservedDate,
    );

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
  const handleDateChange = (key: "startDate" | "endDate", value: string) => {
    const start = key === "startDate" ? value : form.startDate;
    const end = key === "endDate" ? value : form.endDate;

    if (start && end && end < start) {
      setDateError("퇴실일은 입실일보다 빠를 수 없습니다.");
      setField(key, value);
      return;
    }
    setDateError("");

    if (start && end && end >= start) {
      const isWeekday = (d: string) => {
        const day = new Date(d).getDay();
        return day !== 0 && day !== 6;
      };
      const allDates = buildDateRange(start, end);
      const dates = skipWeekends ? allDates.filter(isWeekday) : allDates;
      const filled = bulkClassrooms.filter((c) => c !== "");
      const classrooms: ClassroomReservation[] = dates.flatMap((d) =>
        filled.length > 0
          ? filled.map((c) => ({ classroomName: c, reservedDate: d }))
          : [{ classroomName: "", reservedDate: d }],
      );
      const meals: MealReservation[] = dates.map((d) => ({
        reservedDate: d,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        specialBreakfast: false,
        specialLunch: false,
        specialDinner: false,
      }));
      const roomRange = skipWeekends
        ? allDates.slice(0, -1).filter(isWeekday)
        : allDates.slice(0, -1);
      setRoomDates(roomRange);
      setForm((prev) => ({
        ...prev,
        [key]: value,
        classrooms,
        meals,
        rooms: [],
      }));
    } else {
      setField(key, value);
    }
  };

  const handleSkipWeekendsChange = (checked: boolean) => {
    setSkipWeekends(checked);
    if (!form.startDate || !form.endDate) return;
    const isWeekday = (d: string) => {
      const day = new Date(d).getDay();
      return day !== 0 && day !== 6;
    };
    const allDates = buildDateRange(form.startDate, form.endDate);
    const dates = checked ? allDates.filter(isWeekday) : allDates;
    const filledSkip = bulkClassrooms.filter((c) => c !== "");
    const classrooms: ClassroomReservation[] = dates.flatMap((d) =>
      filledSkip.length > 0
        ? filledSkip.map((c) => ({ classroomName: c, reservedDate: d }))
        : [{ classroomName: "", reservedDate: d }],
    );
    const meals: MealReservation[] = dates.map((d) => ({
      reservedDate: d,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
    }));
    const roomRange = checked
      ? allDates.slice(0, -1).filter(isWeekday)
      : allDates.slice(0, -1);
    setRoomDates(roomRange);
    setForm((prev) => ({ ...prev, classrooms, meals, rooms: [] }));
  };

  // --- 강의실 ---
  const addClassroom = () =>
    setField("classrooms", [
      ...(form.classrooms ?? []),
      { classroomName: "", reservedDate: form.startDate || "" },
    ]);
  const removeClassroom = (i: number) =>
    setField(
      "classrooms",
      (form.classrooms ?? []).filter((_, idx) => idx !== i),
    );
  const updateClassroom = (i: number, patch: Partial<ClassroomReservation>) =>
    setField(
      "classrooms",
      (form.classrooms ?? []).map((c, idx) =>
        idx === i ? { ...c, ...patch } : c,
      ),
    );

  const applyBulkClassroom = () => {
    const dates = getDateRange();
    const filled = bulkClassrooms.filter((c) => c !== "");
    setField(
      "classrooms",
      dates.flatMap((d) =>
        filled.length > 0
          ? filled.map((c) => ({ classroomName: c, reservedDate: d }))
          : [{ classroomName: "", reservedDate: d }],
      ),
    );
  };

  // --- 숙박 ---
  const addRoomDate = () => setRoomDates((prev) => [...prev, ""]);
  const removeRoomDate = (date: string, idx: number) => {
    setRoomDates((prev) => prev.filter((_, i) => i !== idx));
    setField(
      "rooms",
      (form.rooms ?? []).filter((r) => r.reservedDate !== date),
    );
  };
  const updateRoomDate = (oldDate: string, idx: number, newDate: string) => {
    setRoomDates((prev) => prev.map((d, i) => (i === idx ? newDate : d)));
    setField(
      "rooms",
      (form.rooms ?? []).map((r) =>
        r.reservedDate === oldDate ? { ...r, reservedDate: newDate } : r,
      ),
    );
  };

  // 특정 날짜에 선택된 호실 목록
  const getRoomsForDate = (date: string) =>
    (form.rooms ?? [])
      .filter((r) => r.reservedDate === date)
      .map((r) => r.roomNumber);

  // 날짜별 타입별 호실 수
  const countRoomsForDate = (date: string, type: RoomType) =>
    (form.rooms ?? []).filter(
      (r) => r.reservedDate === date && ROOM_INFO[r.roomNumber]?.type === type,
    ).length;

  // 호실 선택 확인 (해당 날짜 기존 항목 교체)
  const handleRoomConfirm = (date: string, pickedRooms: string[]) => {
    const otherDates = (form.rooms ?? []).filter(
      (r) => r.reservedDate !== date,
    );
    const newEntries: RoomReservation[] = pickedRooms.map((num) => ({
      roomNumber: num,
      roomType: ROOM_INFO[num]?.type ?? "1인실",
      reservedDate: date,
    }));
    setField("rooms", [...otherDates, ...newEntries]);
    setPickerDate(null);
  };

  // 전체 날짜 일괄 호실 적용
  const applyBulkRooms = (pickedRooms: string[]) => {
    const dates = getRoomDateRange();
    const newEntries: RoomReservation[] = dates.flatMap((date) =>
      pickedRooms.map((num) => ({
        roomNumber: num,
        roomType: ROOM_INFO[num]?.type ?? "1인실",
        reservedDate: date,
      })),
    );
    setField("rooms", newEntries);
    setBulkRoomPickerOpen(false);
  };

  // --- 식수 ---
  const addMeal = () =>
    setField("meals", [
      ...(form.meals ?? []),
      {
        reservedDate: form.startDate || "",
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        specialBreakfast: false,
        specialLunch: false,
        specialDinner: false,
      },
    ]);
  const removeMeal = (i: number) =>
    setField(
      "meals",
      (form.meals ?? []).filter((_, idx) => idx !== i),
    );
  const updateMeal = (i: number, patch: Partial<MealReservation>) =>
    setField(
      "meals",
      (form.meals ?? []).map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    );

  const applyBulkMeal = () => {
    const dates = getDateRange();
    setField(
      "meals",
      dates.map((d) => ({ reservedDate: d, ...bulkMeal })),
    );
  };

  const handleSave = async () => {
    if (saving) return;
    if (!form.organization.trim()) {
      alert("단체명을 입력해주세요.");
      setTab("기본정보");
      return;
    }
    if (!form.customer.trim()) {
      alert("담당자를 입력해주세요.");
      setTab("기본정보");
      return;
    }
    if (!form.customerPhone.trim()) {
      alert("연락처를 입력해주세요.");
      setTab("기본정보");
      return;
    }
    if (!form.customerEmail?.trim()) {
      alert("이메일을 입력해주세요.");
      setTab("기본정보");
      return;
    }
    if (!form.startDate || !form.endDate) {
      alert("날짜를 입력해주세요.");
      setTab("기본정보");
      return;
    }
    if (dateError) {
      alert(dateError);
      setTab("기본정보");
      return;
    }

    // 강의실 중복 체크
    const conflictedClassrooms = (form.classrooms ?? []).filter(
      isClassroomConflict,
    );
    if (conflictedClassrooms.length > 0) {
      const list = conflictedClassrooms
        .map((c) => `${c.reservedDate} ${c.classroomName}호`)
        .join("\n");
      alert(
        `다음 강의실이 이미 예약되어 있습니다:\n${list}\n\n강의실 탭에서 확인해주세요.`,
      );
      setTab("강의실");
      return;
    }

    // 강의실 내부 중복 체크 (같은 날짜 + 같은 강의실 두 번)
    const internalDups = getClassroomInternalConflicts();
    if (internalDups.some(Boolean)) {
      const dupItems = (form.classrooms ?? []).filter(
        (_, i) => internalDups[i],
      );
      const list = dupItems
        .map((c) => `${c.reservedDate} ${c.classroomName}호`)
        .join("\n");
      alert(`같은 날짜에 동일한 강의실이 중복 입력되어 있습니다:\n${list}`);
      setTab("강의실");
      return;
    }

    // 숙박 호실 중복 체크
    const conflictedRooms = (form.rooms ?? []).filter(isRoomConflict);
    if (conflictedRooms.length > 0) {
      const list = conflictedRooms
        .map((r) => `${r.reservedDate} ${r.roomNumber}호`)
        .join("\n");
      alert(
        `다음 호실이 이미 예약되어 있습니다:\n${list}\n\n숙박 탭에서 확인해주세요.`,
      );
      setTab("숙박");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: isEdit ? reservation.id : Date.now(),
        reservationCode: isEdit
          ? reservation.reservationCode
          : `HK-${Date.now()}`,
        ...form,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        style={{ transform: `translate(${pos.dx}px, ${pos.dy}px)` }}
      >
        <div
          className={styles.modalHeader}
          onMouseDown={handleDragStart}
          onTouchStart={handleTouchStart}
        >
          <div>
            <h3 className={styles.modalTitle}>
              {isEdit ? "예약 상세 / 수정" : "예약 등록"}
            </h3>
            <p className={styles.reqNote}>
              <span className={styles.req}>*</span> 필수 입력 항목
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.activeTab : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          {isEdit && reservation.createdAt && (
            <span className={styles.createdAt}>
              등록일 {reservation.createdAt.slice(0, 10)}
            </span>
          )}
        </div>

        <div className={styles.body}>
          {/* 기본정보 */}
          {tab === "기본정보" && (
            <div className={styles.grid}>
              {!isEdit && (
                <div className={`${styles.fullWidth} ${styles.loadWrap}`}>
                  {!showLoad ? (
                    <button
                      className={styles.loadBtn}
                      onClick={() => setShowLoad(true)}
                    >
                      이전 예약에서 불러오기
                    </button>
                  ) : (
                    <div className={styles.loadPanel}>
                      <div className={styles.loadSearchRow}>
                        <input
                          className={styles.loadInput}
                          autoFocus
                          placeholder="단체명 또는 담당자 검색"
                          value={loadSearch}
                          onChange={(e) => setLoadSearch(e.target.value)}
                        />
                        <button
                          className={styles.loadCancelBtn}
                          onClick={() => {
                            setShowLoad(false);
                            setLoadSearch("");
                          }}
                        >
                          취소
                        </button>
                      </div>
                      {loadCandidates.length === 0 ? (
                        <p className={styles.loadEmpty}>
                          검색 결과가 없습니다.
                        </p>
                      ) : (
                        <ul className={styles.loadList}>
                          {loadCandidates.map((r) => (
                            <li
                              key={r.id}
                              className={styles.loadItem}
                              onClick={() => applyLoad(r)}
                            >
                              <span
                                className={styles.loadDot}
                                style={{ backgroundColor: r.colorCode }}
                              />
                              <span className={styles.loadOrg}>
                                {r.organization}
                              </span>
                              <span className={styles.loadCustomer}>
                                {r.customer} · {r.customerPhone}
                              </span>
                              <span className={styles.loadDate}>
                                {String(r.startDate)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
              <label className={styles.label}>
                <span>
                  단체명 <span className={styles.req}>*</span>
                </span>
                <input
                  className={styles.input}
                  value={form.organization}
                  onChange={(e) => setField("organization", e.target.value)}
                  placeholder="단체명"
                />
              </label>
              <label className={styles.label}>
                교육명
                <input
                  className={styles.input}
                  value={form.purpose}
                  onChange={(e) => setField("purpose", e.target.value)}
                  placeholder="교육명"
                />
              </label>
              <label className={styles.label}>
                <span>
                  인원 <span className={styles.req}>*</span>
                </span>
                <input
                  className={styles.input}
                  type="number"
                  value={form.people || ""}
                  onChange={(e) => setField("people", Number(e.target.value))}
                  placeholder="0"
                />
              </label>
              <label className={styles.label}>
                상태
                <select
                  className={styles.select}
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                <span>
                  담당자 <span className={styles.req}>*</span>
                </span>
                <input
                  className={styles.input}
                  value={form.customer}
                  onChange={(e) => setField("customer", e.target.value)}
                  placeholder="담당자명"
                />
              </label>
              <label className={styles.label}>
                <span>
                  연락처 <span className={styles.req}>*</span>
                </span>
                <input
                  className={styles.input}
                  value={form.customerPhone}
                  onChange={(e) => setField("customerPhone", e.target.value)}
                  placeholder="010-0000-0000"
                />
              </label>
              <label className={styles.label}>
                연락처2
                <input
                  className={styles.input}
                  value={form.customerPhone2 ?? ""}
                  onChange={(e) => setField("customerPhone2", e.target.value)}
                  placeholder="(선택)"
                />
              </label>
              <label className={styles.label}>
                <span>
                  이메일 <span className={styles.req}>*</span>
                </span>
                <input
                  className={styles.input}
                  value={form.customerEmail ?? ""}
                  onChange={(e) => setField("customerEmail", e.target.value)}
                  placeholder="이메일"
                />
              </label>
              <label className={styles.label}>
                <span>
                  입실일 <span className={styles.req}>*</span>
                </span>
                <input
                  className={styles.input}
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                />
              </label>
              <label className={styles.label}>
                <span>
                  퇴실일 <span className={styles.req}>*</span>
                </span>
                <input
                  className={`${styles.input} ${dateError ? styles.inputError : ""}`}
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                />
              </label>
              {dateError && (
                <p className={`${styles.dateError} ${styles.fullWidth}`}>
                  {dateError}
                </p>
              )}
              <label className={`${styles.label} ${styles.fullWidth}`}>
                <span />
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={skipWeekends}
                    onChange={(e) => handleSkipWeekendsChange(e.target.checked)}
                  />
                  주말 제외
                </label>
              </label>
              <label className={`${styles.label} ${styles.fullWidth}`}>
                업체 주소
                <input
                  className={styles.input}
                  value={form.companyAddress ?? ""}
                  onChange={(e) => setField("companyAddress", e.target.value)}
                  placeholder="(선택)"
                />
              </label>
              <label className={styles.label}>
                현장 담당자
                <input
                  className={styles.input}
                  value={form.siteManager ?? ""}
                  onChange={(e) => setField("siteManager", e.target.value)}
                  placeholder="(선택)"
                />
              </label>
              <label className={styles.label}>
                현장 담당자 연락처
                <input
                  className={styles.input}
                  value={form.siteManagerPhone ?? ""}
                  onChange={(e) => setField("siteManagerPhone", e.target.value)}
                  placeholder="(선택)"
                />
              </label>
              <label className={`${styles.label} ${styles.fullWidth}`}>
                색상
                <div className={styles.colorRow}>
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      className={`${styles.colorSwatch} ${form.colorCode === c ? styles.colorSelected : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setField("colorCode", c)}
                    />
                  ))}
                </div>
              </label>
              <label className={`${styles.label} ${styles.fullWidth}`}>
                메모
                <textarea
                  className={styles.textarea}
                  value={form.memo ?? ""}
                  onChange={(e) => setField("memo", e.target.value)}
                  rows={3}
                  placeholder="특이사항 메모"
                />
              </label>
            </div>
          )}

          {/* 강의실 */}
          {tab === "강의실" && (
            <div>
              <div className={styles.classroomStickyTop}>
                {/* 전체 설정 */}
                <div className={styles.bulkRow}>
                  <span className={styles.bulkLabel}>전체 날짜 일괄 적용</span>
                  <div className={styles.bulkClassroomList}>
                    {bulkClassrooms.map((bc, bi) => (
                      <div key={bi} className={styles.bulkClassroomItem}>
                        <select
                          className={styles.cellSelect}
                          value={bc}
                          onChange={(e) =>
                            setBulkClassrooms((prev) =>
                              prev.map((v, idx) =>
                                idx === bi ? e.target.value : v,
                              ),
                            )
                          }
                        >
                          <option value="">강의실 선택</option>
                          {CLASSROOM_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {classroomLabel(o)}
                            </option>
                          ))}
                        </select>
                        {bulkClassrooms.length > 1 && (
                          <button
                            className={styles.removeBulkBtn}
                            onClick={() =>
                              setBulkClassrooms((prev) =>
                                prev.filter((_, idx) => idx !== bi),
                              )
                            }
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    className={styles.addBulkBtn}
                    onClick={() => setBulkClassrooms((prev) => [...prev, ""])}
                  >
                    + 강의실
                  </button>
                  <button
                    className={styles.applyBtn}
                    onClick={applyBulkClassroom}
                  >
                    전체 적용
                  </button>
                </div>
                <div className={styles.listHeader}>
                  <span className={styles.listCount}>
                    총 {(form.classrooms ?? []).length}건
                  </span>
                  <button className={styles.addRowBtn} onClick={addClassroom}>
                    + 추가
                  </button>
                </div>
              </div>
              {(form.classrooms ?? []).length === 0 ? (
                <p className={styles.empty}>강의실 배정 내역이 없습니다.</p>
              ) : (
                <table className={styles.listTable}>
                  <thead>
                    <tr>
                      <th>강의실</th>
                      <th>날짜</th>
                      <th>상태</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const internalDups = getClassroomInternalConflicts();
                      return (form.classrooms ?? []).map((c, i) => {
                        const extConflict = isClassroomConflict(c);
                        const intConflict = internalDups[i];
                        const hasConflict = extConflict || intConflict;
                        return (
                          <tr
                            key={i}
                            className={hasConflict ? styles.conflictRow : ""}
                          >
                            <td>
                              <select
                                className={styles.cellSelect}
                                value={c.classroomName}
                                onChange={(e) =>
                                  updateClassroom(i, {
                                    classroomName: e.target.value,
                                  })
                                }
                              >
                                <option value="">강의실 선택</option>
                                {CLASSROOM_OPTIONS.map((o) => (
                                  <option key={o} value={o}>
                                    {classroomLabel(o)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className={styles.cellInput}
                                type="date"
                                value={c.reservedDate}
                                onChange={(e) =>
                                  updateClassroom(i, {
                                    reservedDate: e.target.value,
                                  })
                                }
                              />
                            </td>
                            <td>
                              {hasConflict && (
                                <span
                                  className={styles.conflictBadge}
                                  title={
                                    extConflict
                                      ? "다른 예약과 중복"
                                      : "내부 중복"
                                  }
                                >
                                  ⚠ {extConflict ? "중복" : "내부중복"}
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className={styles.removeBtn}
                                onClick={() => removeClassroom(i)}
                              >
                                ✕
                              </button>
                            </td>
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
          {tab === "숙박" && (
            <div>
              {!form.startDate || !form.endDate ? (
                <p className={styles.empty}>
                  기본정보 탭에서 입실일·퇴실일을 먼저 입력해주세요.
                </p>
              ) : (
                <>
                  <div className={styles.classroomStickyTop}>
                    <div className={styles.bulkRow}>
                      <span className={styles.bulkLabel}>
                        전체 날짜 일괄 적용
                      </span>
                      <button
                        className={styles.applyBtn}
                        onClick={() => setBulkRoomPickerOpen(true)}
                      >
                        호실 일괄 지정
                      </button>
                    </div>
                    <div className={styles.listHeader}>
                      <span className={styles.listCount}>
                        총 {roomDates.length}일
                      </span>
                      <button className={styles.addRowBtn} onClick={addRoomDate}>
                        + 추가
                      </button>
                    </div>
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
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomDates.map((date, idx) => {
                        const total = (form.rooms ?? []).filter(
                          (r) => r.reservedDate === date,
                        ).length;
                        const roomsForDate = (form.rooms ?? []).filter(
                          (r) => r.reservedDate === date,
                        );
                        const conflictCount =
                          roomsForDate.filter(isRoomConflict).length;
                        return (
                          <tr
                            key={idx}
                            className={
                              conflictCount > 0 ? styles.conflictRow : ""
                            }
                          >
                            <td>
                              <input
                                className={styles.cellInput}
                                type="date"
                                value={date}
                                onChange={(e) =>
                                  updateRoomDate(date, idx, e.target.value)
                                }
                              />
                            </td>
                            {ROOM_TYPES.map((type) => (
                              <td key={type} className={styles.countCell}>
                                {countRoomsForDate(date, type) > 0 ? (
                                  <span className={styles.roomCountBadge}>
                                    {countRoomsForDate(date, type)}
                                  </span>
                                ) : (
                                  <span className={styles.zeroCount}>-</span>
                                )}
                              </td>
                            ))}
                            <td className={styles.countCell}>
                              {total > 0 ? <strong>{total}</strong> : "-"}
                              {conflictCount > 0 && (
                                <span
                                  className={styles.conflictBadge}
                                  title="중복 호실 있음"
                                >
                                  {" "}
                                  ⚠ {conflictCount}개 중복
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className={styles.pickBtn}
                                onClick={() => setPickerDate(date)}
                                disabled={!date}
                              >
                                호실 지정
                              </button>
                            </td>
                            <td>
                              <button
                                className={styles.removeBtn}
                                onClick={() => removeRoomDate(date, idx)}
                              >
                                ✕
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
          {tab === "식수" && (
            <div>
              <div className={styles.classroomStickyTop}>
                {/* 전체 설정 */}
                <div className={styles.bulkRow}>
                  <span className={styles.bulkLabel}>전체 날짜 일괄 적용</span>
                  <label className={styles.bulkMealLabel}>
                    조식
                    <input
                      className={styles.bulkInputSm}
                      type="number"
                      min={0}
                      value={bulkMeal.breakfast || ""}
                      onChange={(e) =>
                        setBulkMeal((p) => ({
                          ...p,
                          breakfast: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                    />
                  </label>
                  <label className={styles.bulkMealLabel}>
                    중식
                    <input
                      className={styles.bulkInputSm}
                      type="number"
                      min={0}
                      value={bulkMeal.lunch || ""}
                      onChange={(e) =>
                        setBulkMeal((p) => ({
                          ...p,
                          lunch: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                    />
                  </label>
                  <label className={styles.bulkMealLabel}>
                    석식
                    <input
                      className={styles.bulkInputSm}
                      type="number"
                      min={0}
                      value={bulkMeal.dinner || ""}
                      onChange={(e) =>
                        setBulkMeal((p) => ({
                          ...p,
                          dinner: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                    />
                  </label>
                  <button className={styles.applyBtn} onClick={applyBulkMeal}>
                    전체 적용
                  </button>
                </div>
                <div className={styles.listHeader}>
                  <span className={styles.listCount}>
                    총 {(form.meals ?? []).length}건
                  </span>
                  <button className={styles.addRowBtn} onClick={addMeal}>
                    + 추가
                  </button>
                </div>
              </div>
              {(form.meals ?? []).length === 0 ? (
                <p className={styles.empty}>식수 내역이 없습니다.</p>
              ) : (
                <table className={styles.listTable}>
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>조식</th>
                      <th>중식</th>
                      <th>석식</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(form.meals ?? []).map((m, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            className={styles.cellInput}
                            type="date"
                            value={m.reservedDate}
                            onChange={(e) =>
                              updateMeal(i, { reservedDate: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <div className={styles.mealCellWrap}>
                            <input
                              className={styles.cellInputSm}
                              type="number"
                              value={m.breakfast || ""}
                              onChange={(e) =>
                                updateMeal(i, {
                                  breakfast: Number(e.target.value),
                                })
                              }
                              placeholder="0"
                            />
                            <button
                              type="button"
                              className={`${styles.specialToggle} ${m.specialBreakfast ? styles.specialToggleOn : ""}`}
                              onClick={() =>
                                updateMeal(i, {
                                  specialBreakfast: !m.specialBreakfast,
                                })
                              }
                            >
                              특식
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className={styles.mealCellWrap}>
                            <input
                              className={styles.cellInputSm}
                              type="number"
                              value={m.lunch || ""}
                              onChange={(e) =>
                                updateMeal(i, { lunch: Number(e.target.value) })
                              }
                              placeholder="0"
                            />
                            <button
                              type="button"
                              className={`${styles.specialToggle} ${m.specialLunch ? styles.specialToggleOn : ""}`}
                              onClick={() =>
                                updateMeal(i, { specialLunch: !m.specialLunch })
                              }
                            >
                              특식
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className={styles.mealCellWrap}>
                            <input
                              className={styles.cellInputSm}
                              type="number"
                              value={m.dinner || ""}
                              onChange={(e) =>
                                updateMeal(i, {
                                  dinner: Number(e.target.value),
                                })
                              }
                              placeholder="0"
                            />
                            <button
                              type="button"
                              className={`${styles.specialToggle} ${m.specialDinner ? styles.specialToggleOn : ""}`}
                              onClick={() =>
                                updateMeal(i, {
                                  specialDinner: !m.specialDinner,
                                })
                              }
                            >
                              특식
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            className={styles.removeBtn}
                            onClick={() => removeMeal(i)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {isEdit && reservation.id && (
              <>
                <button
                  className={styles.tradeBtn}
                  disabled={trading}
                  onClick={async () => {
                    setTrading(true);
                    try { await downloadTrade(reservation.id, reservation.organization); }
                    catch { alert("거래명세서 생성에 실패했습니다."); }
                    finally { setTrading(false); }
                  }}
                >
                  {trading ? "생성 중..." : "거래명세서"}
                </button>
                <button
                  className={styles.estimateBtn}
                  disabled={estimating}
                  onClick={async () => {
                    setEstimating(true);
                    try { await downloadEstimate(reservation.id, reservation.organization); }
                    catch { alert("견적서 생성에 실패했습니다."); }
                    finally { setEstimating(false); }
                  }}
                >
                  {estimating ? "생성 중..." : "견적서"}
                </button>
              </>
            )}
          </div>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>
              닫기
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>

      {/* 호실 선택 도면 모달 */}
      {pickerDate && (
        <RoomPickerModal
          date={pickerDate}
          selected={getRoomsForDate(pickerDate).filter(
            (r) => !getOccupiedRoomsForDate(pickerDate).includes(r),
          )}
          occupiedRooms={getOccupiedRoomsForDate(pickerDate)}
          onConfirm={(rooms) => handleRoomConfirm(pickerDate, rooms)}
          onClose={() => setPickerDate(null)}
        />
      )}

      {/* 일괄 호실 지정 모달 */}
      {bulkRoomPickerOpen && (
        <RoomPickerModal
          date="전체 날짜"
          selected={getRoomsForDate(getRoomDateRange()[0] ?? "")}
          occupiedRooms={[]}
          onConfirm={applyBulkRooms}
          onClose={() => setBulkRoomPickerOpen(false)}
        />
      )}
    </div>
  );
}
