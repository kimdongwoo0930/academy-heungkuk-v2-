"use client";

import { ROOM_INFO, RoomType } from "@/lib/constants/rooms";
import { useState } from "react";
import styles from "./RoomPickerModal.module.css";

interface Props {
  date: string;
  selected: string[];
  occupiedRooms: string[];
  onConfirm: (rooms: string[]) => void;
  onClose: () => void;
}

const TYPE_COLOR: Record<RoomType, string> = {
  "1인실": "#EC008C",
  "2인실": "#0087D4",
  "4인실": "#F5A623",
};

const ROOM_GROUPS: { type: RoomType; rooms: string[] }[] = (
  ["1인실", "2인실", "4인실"] as RoomType[]
).map((type) => ({
  type,
  rooms: Object.keys(ROOM_INFO)
    .filter((k) => ROOM_INFO[k].type === type)
    .sort((a, b) => Number(a) - Number(b)),
}));

export default function RoomPickerModal({
  date,
  selected,
  occupiedRooms,
  onConfirm,
  onClose,
}: Props) {
  const [picked, setPicked] = useState<Set<string>>(new Set(selected));

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
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>호실 선택</h3>
            <p className={styles.subtitle}>{date}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.roomTable}>
            <tbody>
              {ROOM_GROUPS.map(({ type, rooms }) => (
                <tr key={type}>
                  <td className={styles.typeTd}>
                    <span
                      className={styles.typeDot}
                      style={{ backgroundColor: TYPE_COLOR[type] }}
                    />
                    <span className={styles.typeName}>{type}</span>
                    <span className={styles.typeCount}>
                      {countByType(type)}개 선택
                    </span>
                  </td>
                  <td className={styles.roomsTd}>
                    {rooms.map((num) => {
                      const info = ROOM_INFO[num];
                      const isPicked = picked.has(num);
                      const isOccupied = occupiedRooms.includes(num);
                      return (
                        <button
                          key={num}
                          className={`${styles.room} ${isPicked ? styles.roomPicked : ""} ${isOccupied ? styles.roomOccupied : ""}`}
                          style={{ "--room-color": TYPE_COLOR[type] } as React.CSSProperties}
                          onClick={() => !isOccupied && toggle(num)}
                          disabled={isOccupied}
                          title={
                            isOccupied
                              ? `${num}호 — 다른 예약에서 사용 중`
                              : `${num}호 (${info.type}, ${info.cap}인)`
                          }
                        >
                          <span className={styles.roomNum}>{num}</span>
                          <span className={styles.roomCap}>
                            {isOccupied ? "사용중" : `${info.cap}인`}
                          </span>
                        </button>
                      );
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <span className={styles.total}>총 {picked.size}개 선택</span>
          <div className={styles.footerBtns}>
            <button className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button
              className={styles.confirmBtn}
              onClick={() => onConfirm([...picked])}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
