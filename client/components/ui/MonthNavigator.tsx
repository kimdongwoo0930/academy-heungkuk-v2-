"use client";

import { useRef, useState } from "react";
import styles from "./MonthNavigator.module.css";

interface Props {
  year: number;
  month: number; // 0-indexed
  onPrev: () => void;
  onNext: () => void;
  onJump: (year: number, month: number) => void;
}

export default function MonthNavigator({ year, month, onPrev, onNext, onJump }: Props) {
  const [picking, setPicking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = `${year}-${String(month + 1).padStart(2, "0")}`;

  const handleLabelClick = () => {
    setPicking(true);
    setTimeout(() => inputRef.current?.showPicker?.(), 50);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m] = e.target.value.split("-").map(Number);
    onJump(y, m - 1);
    setPicking(false);
  };

  return (
    <div className={styles.nav}>
      <button className={styles.navBtn} onClick={onPrev}>‹</button>
      {picking ? (
        <input
          ref={inputRef}
          type="month"
          className={styles.monthInput}
          defaultValue={value}
          onChange={handleChange}
          onBlur={() => setPicking(false)}
          autoFocus
        />
      ) : (
        <button className={styles.monthLabel} onClick={handleLabelClick} title="클릭하여 날짜 이동">
          {year}년 {month + 1}월
        </button>
      )}
      <button className={styles.navBtn} onClick={onNext}>›</button>
    </div>
  );
}
