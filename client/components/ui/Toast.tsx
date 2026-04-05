"use client";

import { useToastStore } from "@/store/toast";
import styles from "./Toast.module.css";

export default function Toast() {
  const { message, type } = useToastStore();
  if (!message) return null;
  return <div className={`${styles.toast} ${styles[type]}`}>{message}</div>;
}
