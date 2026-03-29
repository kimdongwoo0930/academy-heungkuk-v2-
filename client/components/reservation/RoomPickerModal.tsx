"use client";

import { ROOM_INFO, RoomType } from "@/lib/constants/rooms";
import { printRoomViewForDate } from "@/lib/utils/printRoomTable";
import { useRef, useState } from "react";
import styles from "./RoomPickerModal.module.css";

interface Props {
  date: string;
  selected: string[];
  occupiedRooms: string[];
  onConfirm: (rooms: string[]) => void;
  onClose: () => void;
  viewOnly?: boolean;
  roomColors?: Record<string, string>;
  orgLegend?: { color: string; organization: string }[];
}

const TYPE_COLOR: Record<RoomType, string> = {
  "1인실": "#EC008C",
  "2인실": "#0087D4",
  "4인실": "#F5A623",
};

const TYPE_PASTEL: Record<RoomType, string> = {
  "1인실": "#fce4f3",
  "2인실": "#daeeff",
  "4인실": "#fef3dc",
};

// 각 방/라벨의 명시적 그리드 위치
// row: 1-indexed half-row 시작 (각 방은 span 2)
// 한 칸씩 반행(half-row) 내려가면 → 옆 방 높이의 중간쯤에 위치
interface CellDef {
  id: string;
  isLabel?: boolean;
  row: number;
  col: number;
  colSpan?: number;
}

//  구조 개요 (col 1~17, half-row 1~11):
//   col: 1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17
//  row1:               109  110  111  [화]  127  126
//  row2:          108                            125
//  row3:     107                                      124
//  row4:106  101  [현관][현관][현관]  112  123
//  row5:102                            113       122
//  row6:     103                            114       121
//  row7:104                                 115       120
//  row8:                                         116       119
//  row9:                                              117
// row10:                                                   118

const LAYOUT: CellDef[] = [
  // ── 상단 복도 ──
  { id: "109", row: 1, col: 5 },
  { id: "110", row: 1, col: 6 },
  { id: "111", row: 1, col: 7 },
  { id: "화장실", isLabel: true, row: 1, col: 8 },
  { id: "127", row: 1, col: 9 },
  { id: "126", row: 1, col: 10 },

  // ── 좌측 상단 대각선 (↙) ──
  { id: "108", row: 2, col: 4 },
  { id: "107", row: 3, col: 3 },
  { id: "106", row: 4, col: 2 },
  { id: "105", row: 5, col: 1 },

  // ── 우측 상단 대각선 (↘) ──
  { id: "125", row: 2, col: 11 },
  { id: "124", row: 3, col: 12 },
  { id: "123", row: 4, col: 13 },
  { id: "122", row: 5, col: 14 },
  { id: "121", row: 6, col: 15 },
  { id: "120", row: 7, col: 16 },
  { id: "119", row: 8, col: 17 },

  // ── 현관 라벨 ──
  { id: "현관", isLabel: true, row: 6, col: 7, colSpan: 2 },

  // ── 좌측 하단 대각선 (↙) — 106 기준 2칸 간격 ──
  { id: "101", row: 6, col: 5 },
  { id: "102", row: 7, col: 4 },
  { id: "103", row: 8, col: 3 },
  { id: "104", row: 9, col: 2 },

  // ── 우측 하단 대각선 (↘) — 125 기준 2칸 간격 ──
  { id: "112", row: 6, col: 10 },
  { id: "113", row: 7, col: 11 },
  { id: "114", row: 8, col: 12 },
  { id: "115", row: 9, col: 13 },
  { id: "116", row: 10, col: 14 },
  { id: "117", row: 11, col: 15 },
  { id: "118", row: 12, col: 16 },
];

// 그리드 크기 (CSS 변수로 전달)
const GRID_COLS = 17;
const GRID_ROWS = 13; // half-rows

export default function RoomPickerModal({
  date,
  selected,
  occupiedRooms,
  onConfirm,
  onClose,
  viewOnly = false,
  roomColors = {},
  orgLegend = [],
}: Props) {
  const [picked, setPicked] = useState<Set<string>>(new Set(selected));
  const [pos, setPos] = useState({ dx: 0, dy: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    dx: number;
    dy: number;
  } | null>(null);

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
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

  const toggle = (num: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const countByType = (type: RoomType) =>
    [...picked].filter((n) => ROOM_INFO[n]?.type === type).length;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        style={{ transform: `translate(${pos.dx}px, ${pos.dy}px)` }}
      >
        <div
          className={styles.header}
          onMouseDown={handleDragStart}
          onTouchStart={handleTouchStart}
        >
          <div>
            <h3 className={styles.title}>
              {viewOnly ? "호실 현황" : "호실 선택"}
            </h3>
            <p className={styles.subtitle}>
              {viewOnly
                ? (() => {
                    const d = new Date(date);
                    d.setDate(d.getDate() + 1);
                    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    return `${date} ~ ${next}`;
                  })()
                : date}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 범례 */}
        <div className={styles.legend}>
          {viewOnly ? (
            orgLegend.length > 0 ? (
              orgLegend.map(({ color, organization }) => (
                <div key={color} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: color }}
                  />
                  <span>{organization}</span>
                </div>
              ))
            ) : (
              <div className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: "#ccc" }}
                />
                <span>예약 없음</span>
              </div>
            )
          ) : (
            <>
              {(Object.entries(TYPE_COLOR) as [RoomType, string][]).map(
                ([type, color]) => (
                  <div key={type} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: color }}
                    />
                    <span>
                      {type}
                      {countByType(type) > 0 ? ` (${countByType(type)}개)` : ""}
                    </span>
                  </div>
                ),
              )}
              <div className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: "#ccc" }}
                />
                <span>사용중</span>
              </div>
            </>
          )}
        </div>

        {/* 도면 */}
        <div className={styles.floorWrap}>
          <div
            className={styles.floorGrid}
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 36px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 18px)`,
            }}
          >
            {LAYOUT.map((cell) => {
              const gridRow = `${cell.row} / span 2`;
              const gridColumn = cell.colSpan
                ? `${cell.col} / span ${cell.colSpan}`
                : `${cell.col}`;

              if (cell.isLabel) {
                return (
                  <div
                    key={cell.id}
                    className={styles.floorLabel}
                    style={{ gridRow, gridColumn }}
                  >
                    {cell.id}
                  </div>
                );
              }

              const info = ROOM_INFO[cell.id];
              const isPicked = picked.has(cell.id);
              const isOccupied = occupiedRooms.includes(cell.id);
              const viewColor = viewOnly ? roomColors[cell.id] : undefined;
              const color = viewColor ?? TYPE_COLOR[info.type];
              const pastel = TYPE_PASTEL[info.type];

              const cellClass = [
                styles.roomCell,
                viewOnly ? styles.roomViewOnly : "",
                viewOnly && viewColor ? styles.roomPicked : "",
                !viewOnly && isPicked ? styles.roomPicked : "",
                !viewOnly && isOccupied ? styles.roomOccupied : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={cell.id}
                  className={cellClass}
                  style={
                    {
                      gridRow,
                      gridColumn,
                      "--c": color,
                      "--bg": pastel,
                    } as React.CSSProperties
                  }
                  onClick={
                    viewOnly ? undefined : () => !isOccupied && toggle(cell.id)
                  }
                  disabled={!viewOnly && isOccupied}
                  title={
                    viewOnly
                      ? viewColor
                        ? `${cell.id}호 — 예약됨`
                        : `${cell.id}호 (${info.type})`
                      : isOccupied
                        ? `${cell.id}호 — 사용중`
                        : `${cell.id}호 (${info.type})`
                  }
                >
                  <span className={styles.cellNum}>{cell.id}</span>
                  <span className={styles.cellCap}>
                    {!viewOnly && isOccupied ? "사용중" : `${info.cap}인`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {viewOnly ? (
          <div className={styles.footer}>
            <span className={styles.total}>
              사용중 {occupiedRooms.length}개
            </span>
            <div className={styles.footerBtns}>
              <button
                className={styles.cancelBtn}
                onClick={() =>
                  printRoomViewForDate(date, occupiedRooms, roomColors, orgLegend)
                }
              >
                인쇄
              </button>
              <button className={styles.cancelBtn} onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.footer}>
            <span className={styles.total}>총 {picked.size}개 선택</span>
            <div className={styles.footerBtns}>
              <button className={styles.cancelBtn} onClick={onClose}>
                취소
              </button>
              <button
                className={styles.confirmBtn}
                onClick={() => onConfirm([...picked])}
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
