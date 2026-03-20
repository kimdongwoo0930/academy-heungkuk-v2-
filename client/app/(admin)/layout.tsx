'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import styles from "./layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/auth/login');
    }
  }, [router]);

  return (
    <>
      <Sidebar />
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </>
  );
}
