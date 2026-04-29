import { ReactNode } from "react";
import styles from "./KpiCard.module.css";

type Variant = "pink" | "green" | "blue" | "yellow";

interface Props {
  label: string;
  value: string | number;
  subText: ReactNode;
  icon: string;
  variant: Variant;
  animDelay?: string;
  onClick?: () => void;
}

export default function KpiCard({
  label,
  value,
  subText,
  icon,
  variant,
  animDelay,
  onClick,
}: Props) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${onClick ? styles.clickable : ''}`}
      style={animDelay ? { animationDelay: animDelay } : undefined}
      onClick={onClick}
    >
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <div className={styles.icon}>{icon}</div>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.sub}>{subText}</div>
    </div>
  );
}
