"use client";

import { STATUS_COLOR } from "@/lib/constants/status";
import { Reservation } from "@/types/reservation";
import { useRef, useState } from "react";
import styles from "./ReservationTooltip.module.css";

interface Props {
  reservation: Reservation;
  children: React.ReactNode;
}

export default function ReservationTooltip({
  reservation: res,
  children,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const tooltipW = 240;
    const tooltipH = 130;
    const x =
      e.clientX + 14 + tooltipW > window.innerWidth
        ? e.clientX - tooltipW - 8
        : e.clientX + 14;
    const y =
      e.clientY + 14 + tooltipH > window.innerHeight
        ? e.clientY - tooltipH - 8
        : e.clientY + 14;
    setPos({ x, y });
  };

  return (
    <span
      ref={ref}
      onMouseEnter={(e) => {
        handleMouseMove(e);
        setVisible(true);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setVisible(false)}
      style={{ display: "contents" }}
    >
      {children}
      {visible && (
        <div className={styles.card} style={{ left: pos.x, top: pos.y }}>
          <div className={styles.row}>
            <span className={styles.orgName}>{res.organization}</span>
            <span
              className={styles.badge}
              style={{ color: STATUS_COLOR[res.status] ?? "#555" }}
            >
              {res.status}
            </span>
          </div>
          <div className={styles.divider} />
          <div className={styles.info}>
            <span className={styles.key}>기간</span>
            <span>
              {res.startDate} ~ {res.endDate}
            </span>
          </div>
          <div className={styles.info}>
            <span className={styles.key}>인원</span>
            <span>{res.people}명</span>
            {res.purpose && (
              <>
                <span className={styles.sep}>·</span>
                <span>{res.purpose}</span>
              </>
            )}
          </div>
          <div className={styles.info}>
            <span className={styles.key}>담당</span>
            <span>{res.customer}</span>
            <span className={styles.sep}>·</span>
            <span>{res.customerPhone}</span>
          </div>
          <div className={styles.tags}>
            <span
              className={
                res.rooms && res.rooms.length > 0 ? styles.tagOn : styles.tagOff
              }
            >
              숙박 {res.rooms && res.rooms.length > 0 ? "O" : "X"}
            </span>
            <span
              className={
                res.meals && res.meals.length > 0 ? styles.tagOn : styles.tagOff
              }
            >
              식사 {res.meals && res.meals.length > 0 ? "O" : "X"}
            </span>
          </div>
        </div>
      )}
    </span>
  );
}
