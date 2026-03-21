"use client";

import HeungkukLogo from "@/components/ui/HeungkukLogo";
import {
  CLASSROOM_CATEGORIES,
  CLASSROOM_ROOM_TO_CATEGORY,
} from "@/lib/constants/classrooms";
import { RoomType } from "@/lib/constants/rooms";
import { exportQuoteToDocx } from "@/lib/utils/exportQuoteToDocx";
import { getCachedSettings } from "@/lib/utils/priceSettings";
import { Reservation, RoomReservation } from "@/types/reservation";
import styles from "./QuotePreviewModal.module.css";

interface Props {
  reservation: Reservation;
  onClose: () => void;
}
const ROOM_TYPES: RoomType[] = ["4인실", "2인실", "1인실"];
const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  "4인실": "4인 침대",
  "2인실": "2인 침대",
  "1인실": "1인 침대",
};

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}
function taxOf(n: number) {
  return Math.floor(n * 0.1);
}
function totalOf(n: number) {
  return n + taxOf(n);
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dow = "일월화수목금토"[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dow})`;
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}일(${"일월화수목금토"[d.getDay()]})`;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  while (d <= e) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getRoomStat(entries: RoomReservation[]) {
  if (!entries.length) return null;
  const uniqueRooms = new Set(entries.map((e) => e.roomNumber)).size;
  const total = entries.length;
  const nightsEach = total / uniqueRooms;
  return {
    nights: Number.isInteger(nightsEach) ? nightsEach : null,
    rooms: uniqueRooms,
    total,
  };
}

export default function QuotePreviewModal({ reservation, onClose }: Props) {
  const rooms = reservation.rooms ?? [];
  const classrooms = reservation.classrooms ?? [];
  const meals = reservation.meals ?? [];

  const appSettings = getCachedSettings();
  const ROOM_PRICE = appSettings.prices.roomPrice;
  const MEAL_PRICE = appSettings.prices.mealPrice;
  const SPECIAL_MEAL_PRICE = appSettings.prices.specialMealPrice;
  const CLASSROOM_PRICE: Record<string, { label: string; pricePerDay: number }> = Object.fromEntries(
    Object.entries(appSettings.prices.classrooms).map(([k, v]) => [k, { label: k, pricePerDay: v as number }])
  );
  const contact = appSettings.contact;

  // 숙박비 — 3개 타입 항상 표시
  const roomRows = ROOM_TYPES.map((type) => {
    const entries = rooms.filter((r) => r.roomType === type);
    const stat = getRoomStat(entries);
    const supply = stat ? stat.total * ROOM_PRICE : 0;
    return { type, stat, supply };
  });
  const roomSupply = roomRows.reduce((s, r) => s + r.supply, 0);

  // 강의실비 — 호실번호 → 카테고리 매핑 후 집계
  const classroomRows = CLASSROOM_CATEGORIES.map((cat) => {
    const entries = classrooms.filter(
      (c) => CLASSROOM_ROOM_TO_CATEGORY[c.classroomName] === cat,
    );
    const uniqueDates = new Set(entries.map((e) => e.reservedDate)).size;
    const uniqueRooms = new Set(entries.map((e) => e.classroomName)).size;
    const totalEntries = entries.length; // 가격 계산용 (실×일)
    const info = CLASSROOM_PRICE[cat];
    const supply = totalEntries > 0 ? totalEntries * info.pricePerDay : 0;
    return { cat, uniqueDates, uniqueRooms, totalEntries, info, supply };
  });
  const classroomSupply = classroomRows.reduce((s, r) => s + r.supply, 0);

  const facilitySupply = roomSupply + classroomSupply;

  // 식비
  const totalMeals = meals.reduce(
    (s, m) => s + m.breakfast + m.lunch + m.dinner,
    0,
  );
  const mealSupply = totalMeals * MEAL_PRICE;

  // 식수 현황
  const dateRange = getDatesInRange(reservation.startDate, reservation.endDate);
  const mealByDate = Object.fromEntries(meals.map((m) => [m.reservedDate, m]));

  const nights = Math.ceil(
    (new Date(reservation.endDate + "T00:00:00").getTime() -
      new Date(reservation.startDate + "T00:00:00").getTime()) /
      86_400_000,
  );
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <div className={styles.actions}>
          <button
            className={styles.wordBtn}
            onClick={() => exportQuoteToDocx(reservation)}
          >
            📄 워드 다운로드
          </button>

          <button className={styles.printBtn} onClick={() => window.print()}>
            🖨️ 인쇄 / PDF 저장
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕ 닫기
          </button>
        </div>

        <div id="quotePrintArea" className={styles.doc}>
          {/* ── 최상단: 로고 | 제목 | 공급자 ── */}
          <div className={styles.topRow}>
            <div className={styles.logoArea}>
              <HeungkukLogo size={38} />
              <div className={styles.logoText}>
                <span className={styles.logoMain}>Heungkuk</span>
                <span className={styles.logoSub}>Life Insurance</span>
              </div>
            </div>
            <div className={styles.titleArea}>
              <h1 className={styles.docTitle}>견 &nbsp; 적 &nbsp; 서</h1>
            </div>
            <div className={styles.supplierArea}>
              <table className={styles.supplierTable}>
                <tbody>
                  <tr>
                    <td rowSpan={4} className={styles.supSide}>
                      공<br />급<br />자
                    </td>
                    <th>등 록 번 호</th>
                    <td colSpan={2}>135 - 85 - 03824</td>
                  </tr>
                  <tr>
                    <th>상&nbsp;&nbsp;&nbsp;&nbsp;호</th>
                    <td>흥국생명보험㈜ 연수원</td>
                  </tr>
                  <tr>
                    <th>사업장소재지</th>
                    <td colSpan={2}>
                      경기도 용인시 기흥구 중부대로819번길 57-9
                    </td>
                  </tr>
                  <tr>
                    <th>대표</th>
                    <td style={{ whiteSpace: "nowrap" }}>{contact.representative}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 수신자 이름 ── */}
          <div className={styles.recipientName}>
            {reservation.organization}&nbsp;&nbsp;귀중
          </div>

          {/* ── 수신자 연락처 | 연수원 담당자 ── */}
          <div className={styles.contactRow}>
            <div className={styles.contactLeft}>
              <div className={styles.contactLine}>
                <b>▶ 견 적 일 자 :</b>&nbsp; {today}
              </div>
              <div className={styles.contactLine}>
                <b>▶ 담 &nbsp; 당 &nbsp; 자 :</b>&nbsp; {reservation.customer}{" "}
                님
              </div>
              <div className={styles.contactLine}>
                <b>▶ 연 &nbsp; 락 &nbsp; 처 :</b>&nbsp;{" "}
                {reservation.customerPhone}
              </div>
              {reservation.customerPhone2 && (
                <div className={styles.contactLine}>
                  <b>▶ 연 락 처 2 :</b>&nbsp; {reservation.customerPhone2}
                </div>
              )}
              {reservation.customerEmail && (
                <div className={styles.contactLine}>
                  <b>▶ 이 &nbsp; 메 &nbsp; 일 :</b>&nbsp;{" "}
                  {reservation.customerEmail}
                </div>
              )}
            </div>
            <div className={styles.contactRight}>
              <div className={styles.contactLine}>
                <b>▷ 담 &nbsp; 당 &nbsp; 자 :</b>&nbsp; {contact.manager}
              </div>
              <div className={styles.contactLine}>
                <b>▷ 연 &nbsp; 락 &nbsp; 처 :</b>&nbsp; T.
                {contact.phone}(직통)&nbsp; F. {contact.fax}
              </div>
              <div className={styles.contactLine}>
                <b>▷ E - Mail :</b>&nbsp; {contact.email}
              </div>
              <div className={styles.contactLine}>
                <b>▷ 홈페이지 :</b>&nbsp; http://www.hungkukacademy.co.kr/
              </div>
            </div>
          </div>

          {/* ── 기본 정보 ── */}
          <table className={styles.infoTable}>
            <tbody>
              <tr>
                <th>회 사 명</th>
                <td colSpan={3}>{reservation.organization}</td>
              </tr>
              <tr>
                <th>교육 명칭</th>
                <td colSpan={3}>{reservation.purpose}</td>
              </tr>
              <tr>
                <th>사용 기간</th>
                <td>{formatDateLong(reservation.startDate)}</td>
                <td className={styles.tdC}>~</td>
                <td>
                  {formatDateLong(reservation.endDate)}&nbsp;&nbsp; {nights}박
                  {nights + 1}일
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── 견적 상세 ── */}
          <table className={styles.quoteTable}>
            <thead>
              <tr>
                <th className={styles.colCat}>품&nbsp;&nbsp;목</th>
                <th>규&nbsp;&nbsp;격</th>
                <th className={styles.colQty}>수&nbsp;&nbsp;량</th>
                <th className={styles.colMoney}>단&nbsp;&nbsp;가</th>
                <th className={styles.colMoney}>공&nbsp;급&nbsp;가&nbsp;액</th>
                <th className={styles.colMoney}>세&nbsp;&nbsp;액</th>
                <th className={styles.colMoney}>합&nbsp;&nbsp;계</th>
              </tr>
            </thead>
            <tbody>
              {/* 숙박비 — 3개 타입 항상 표시 */}
              {roomRows.map((r, i) => (
                <tr key={r.type}>
                  {i === 0 && (
                    <td rowSpan={roomRows.length} className={styles.catCell}>
                      숙박비
                    </td>
                  )}
                  <td>{ROOM_TYPE_LABEL[r.type]}</td>
                  <td className={styles.tdC}>
                    {r.stat ? (
                      r.stat.nights !== null
                        ? `${r.stat.nights} 박  ${r.stat.rooms} 실`
                        : `총 ${r.stat.total} 박실`
                    ) : (
                      <span className={styles.unitOnly}>박&nbsp;&nbsp;&nbsp;&nbsp;실</span>
                    )}
                  </td>
                  <td className={styles.tdR}>{fmt(ROOM_PRICE)}</td>
                  <td className={styles.tdC}>{r.stat ? fmt(r.supply) : "-"}</td>
                  <td className={styles.tdC}>{r.stat ? fmt(taxOf(r.supply)) : "-"}</td>
                  <td className={styles.tdC}>{r.stat ? fmt(totalOf(r.supply)) : "-"}</td>
                </tr>
              ))}

              {/* 강의실비 — 7개 고정 행 */}
              {classroomRows.map((c, i) => (
                <tr key={c.cat}>
                  {i === 0 && (
                    <td
                      rowSpan={classroomRows.length}
                      className={styles.catCell}
                    >
                      강의실비
                    </td>
                  )}
                  <td>{c.info.label}</td>
                  <td className={styles.tdC}>
                    {c.totalEntries > 0 ? (
                      `${c.uniqueDates} 일  ${c.uniqueRooms} 실`
                    ) : (
                      <span className={styles.unitOnly}>
                        일&nbsp;&nbsp;&nbsp;&nbsp;실
                      </span>
                    )}
                  </td>
                  <td className={styles.tdR}>{fmt(c.info.pricePerDay)}</td>
                  <td className={styles.tdC}>
                    {c.totalEntries > 0 ? fmt(c.supply) : "-"}
                  </td>
                  <td className={styles.tdC}>
                    {c.totalEntries > 0 ? fmt(taxOf(c.supply)) : "-"}
                  </td>
                  <td className={styles.tdC}>
                    {c.totalEntries > 0 ? fmt(totalOf(c.supply)) : "-"}
                  </td>
                </tr>
              ))}

              {/* 시설 계 */}
              <tr className={styles.subtotalRow}>
                <td colSpan={4} className={styles.tdC}>
                  시 설 계
                </td>
                <td className={styles.tdR}>{fmt(facilitySupply)}</td>
                <td className={styles.tdR}>{fmt(taxOf(facilitySupply))}</td>
                <td className={styles.tdR}>{fmt(totalOf(facilitySupply))}</td>
              </tr>

              {/* 식비 */}
              <tr>
                <td rowSpan={2} className={styles.catCell}>
                  식비
                </td>
                <td>일반식 기준</td>
                <td className={styles.tdC}>
                  {totalMeals > 0 ? (
                    `${fmt(totalMeals)} 식`
                  ) : (
                    <span className={styles.unitOnly}>식</span>
                  )}
                </td>
                <td className={styles.tdR}>{fmt(MEAL_PRICE)}</td>
                <td className={styles.tdC}>
                  {mealSupply > 0 ? fmt(mealSupply) : "-"}
                </td>
                <td className={styles.tdC}>
                  {mealSupply > 0 ? fmt(taxOf(mealSupply)) : "-"}
                </td>
                <td className={styles.tdC}>
                  {mealSupply > 0 ? fmt(totalOf(mealSupply)) : "-"}
                </td>
              </tr>
              <tr>
                <td>특식</td>
                <td className={styles.tdC}>
                  <span className={styles.unitOnly}>식</span>
                </td>
                <td className={styles.tdR}>{fmt(SPECIAL_MEAL_PRICE)}</td>
                <td className={styles.tdC}>-</td>
                <td className={styles.tdC}>-</td>
                <td className={styles.tdC}>-</td>
              </tr>

              {/* 식비 계 */}
              <tr className={styles.subtotalRow}>
                <td colSpan={4} className={styles.tdC}>
                  식 비 계
                </td>
                <td className={styles.tdC}>
                  {mealSupply > 0 ? fmt(mealSupply) : "-"}
                </td>
                <td className={styles.tdC}>
                  {mealSupply > 0 ? fmt(taxOf(mealSupply)) : "-"}
                </td>
                <td className={styles.tdC}>
                  {mealSupply > 0 ? fmt(totalOf(mealSupply)) : "-"}
                </td>
              </tr>

              {/* 시설 + 식비 계 */}
              <tr className={styles.totalRow}>
                <td colSpan={4} className={styles.tdC}>
                  시 설 + 식 비 계
                </td>
                <td className={styles.tdR}>
                  {fmt(facilitySupply + mealSupply)}
                </td>
                <td className={styles.tdR}>
                  {fmt(taxOf(facilitySupply + mealSupply))}
                </td>
                <td className={styles.tdR}>
                  {fmt(totalOf(facilitySupply + mealSupply))}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── 식수 현황 ── */}
          <p className={styles.sectionLabel}>▶ 식수 현황(일반식)</p>
          <div className={styles.mealTableWrap}>
            <table className={styles.mealTable}>
              <thead>
                <tr>
                  <th>구 분</th>
                  {dateRange.map((d) => (
                    <th key={d}>{formatDateShort(d)}</th>
                  ))}
                  <th>식수계</th>
                </tr>
              </thead>
              <tbody>
                {(["breakfast", "lunch", "dinner"] as const).map((key, idx) => {
                  const labels = ["조식", "중식", "석식"];
                  const rowTotal = dateRange.reduce(
                    (s, d) => s + (mealByDate[d]?.[key] ?? 0),
                    0,
                  );
                  return (
                    <tr key={key}>
                      <td>{labels[idx]}</td>
                      {dateRange.map((d) => (
                        <td key={d} className={styles.tdR}>
                          {mealByDate[d]?.[key] || "-"}
                        </td>
                      ))}
                      <td className={styles.tdR}>{rowTotal || "-"}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td>소계</td>
                  {dateRange.map((d) => {
                    const m = mealByDate[d];
                    const t = m ? m.breakfast + m.lunch + m.dinner : 0;
                    return (
                      <td key={d} className={styles.tdR}>
                        {t || "-"}
                      </td>
                    );
                  })}
                  <td className={styles.tdR}>{totalMeals || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── 유의사항 ── */}
          <div className={styles.notes}>
            <p className={styles.noteHighlight}>
              ★대관견적서 이메일 전송 후 연수원 시설 사용여부를 15일이내
              이메일로 재전송 부탁드립니다
            </p>
            <p className={styles.noteHighlight2}>
              (대관계약서는 별도로 없고 대관확인서 작성 후 서명 및 도장날인이
              완료되면 예약완료됩니다)
            </p>
            <div className={styles.noteBody}>
              <p className={styles.noteHead}>▶시설 이용시 유의사항</p>
              <p>
                ▹ 특식은 별도 예약 바라며 10일 전 확정되어야 합니다.(070 - 8915
                - 0872 장지원 점장)
              </p>
              <p>
                ** 식당 운영 시간 : 조식(07:30~08:30), 중식(12:00~13:00),
                석식(18:00~19:00)
              </p>
              <p>
                ** 식사는 예약제로 운영되기때문에 신청 인원에서 변동이 있을 경우
                입소 4일전 오전 10시까지 확정 통보하여 주시기 바랍니다.
              </p>
              <p>
                &nbsp;&nbsp;&nbsp;(통보가 없을 시 신청인원으로 청구되며,
                인원초과시는 초과 인원으로 정산합니다.)
              </p>
              <p>
                ** 시설(강의실,숙박)과 식당의 사업자가 달라 결제가 별도로
                진행되는 점 참고하여 주시기 바랍니다.
              </p>
              <p className={styles.noteHead} style={{ marginTop: "6px" }}>
                ▷ 기타
              </p>
              <p>** 생활관(숙소) : 입실(13시) / 퇴실(09:30)</p>
              <p>** 연수원내 바베큐 행사 및 취사 불가</p>
              <p>** 퇴소일이 주말, 공휴일일 경우 전일 정산합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
