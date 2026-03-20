"use client";

import HeungkukLogo from "@/components/ui/HeungkukLogo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "대시보드", href: "/dashboard", icon: "📊" },
  { label: "예약 관리", href: "/reservation", icon: "📋" },
  { label: "일정 현황", href: "/scheduler", icon: "📅" },
  { label: "설문 관리", href: "/load", icon: "📝" },
  { label: "식당 관리", href: "/restaurant", icon: "🍽️" },
  { label: "문서 관리", href: "/document", icon: "📄" },
  { label: "설정", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/auth/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <HeungkukLogo size={32} />
        <span className={styles.logoText}>
          흥국생명
          <br />
          연수원 관리
        </span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.active : ""}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span>🚪</span>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
