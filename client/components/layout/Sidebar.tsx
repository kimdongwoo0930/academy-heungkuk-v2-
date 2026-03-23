"use client";

import HeungkukLogo from "@/components/ui/HeungkukLogo";
import { isAdmin } from "@/lib/utils/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "일정 현황", href: "/scheduler", icon: "📅", adminOnly: false },
  { label: "예약 관리", href: "/reservation", icon: "📋", adminOnly: false },
  { label: "설문 관리", href: "/load", icon: "📝", adminOnly: false },
  { label: "식수 관리", href: "/restaurant", icon: "🍽️", adminOnly: false },
  { label: "숙박 현황", href: "/accommodation", icon: "🛏️", adminOnly: false },
  { label: "문서 관리", href: "/document", icon: "📄", adminOnly: true },
  { label: "설정", href: "/settings", icon: "⚙️", adminOnly: true },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = isAdmin();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/auth/login");
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.logo}>
        <HeungkukLogo size={32} />
        {!collapsed && (
          <span className={styles.logoText}>
            흥국생명연수원
            <br />
            대관 관리
          </span>
        )}
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          title={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.filter((item) => !item.adminOnly || admin).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.active : ""} ${collapsed ? styles.navItemCollapsed : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button
          className={`${styles.logoutBtn} ${collapsed ? styles.logoutBtnCollapsed : ""}`}
          onClick={handleLogout}
          title={collapsed ? "로그아웃" : undefined}
        >
          <span>🚪</span>
          {!collapsed && "로그아웃"}
        </button>
      </div>
    </aside>
  );
}
