'use client';

import { useEffect, useState } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/auth/login');
    }
  }, [router]);

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <Header collapsed={collapsed} />
      <main className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <div className={styles.content}>{children}</div>
      </main>
    </>
  );
}
