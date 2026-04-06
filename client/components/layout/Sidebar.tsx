'use client';

import HeungkukLogo from '@/components/ui/HeungkukLogo';
import { isAdmin } from '@/lib/utils/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';
import {
    BsBarChart,
    BsBuildingCheck,
    BsCalendar3,
    BsClipboardCheck,
    BsFileEarmarkText,
    BsGear,
    BsLayoutSidebar,
    BsLayoutSidebarReverse,
} from 'react-icons/bs';
import { MdRestaurant } from 'react-icons/md';
import ProfileDropdown from './ProfileDropdown';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { label: string; href: string; Icon: IconType; adminOnly: boolean; disabled: boolean }[] = [
    { label: '일정 현황', href: '/scheduler', Icon: BsCalendar3, adminOnly: false, disabled: false },
    { label: '예약 관리', href: '/reservation', Icon: BsClipboardCheck, adminOnly: false, disabled: false },
    { label: '식수 관리', href: '/restaurant', Icon: MdRestaurant, adminOnly: false, disabled: false },
    { label: '숙박 현황', href: '/accommodation', Icon: BsBuildingCheck, adminOnly: false, disabled: false },
    { label: '문서 관리', href: '/document', Icon: BsFileEarmarkText, adminOnly: true, disabled: false },
    { label: '설문 관리', href: '/load', Icon: BsBarChart, adminOnly: false, disabled: false },
    { label: '설정', href: '/settings', Icon: BsGear, adminOnly: true, disabled: false },
];

interface Props {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
    const pathname = usePathname();
    const admin = isAdmin();

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.logo}>
                {!collapsed && (
                    <span className={styles.logoIconWrap}>
                        <HeungkukLogo size={32} />
                    </span>
                )}
                {!collapsed && (
                    <span className={styles.logoText}>
                        흥국생명연수원
                        <br />
                        대관 관리
                    </span>
                )}
                <button className={styles.toggleBtn} onClick={onToggle} title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}>
                    {collapsed ? <BsLayoutSidebar /> : <BsLayoutSidebarReverse />}
                </button>
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.filter((item) => !item.adminOnly || admin).map((item) =>
                    item.disabled ? (
                        <span
                            key={item.href}
                            className={`${styles.navItem} ${styles.navItemDisabled} ${collapsed ? styles.navItemCollapsed : ''}`}
                            title={collapsed ? `${item.label} (준비중)` : undefined}
                        >
                            <item.Icon className={styles.navIcon} />
                            {!collapsed && (
                                <>
                                    {item.label}
                                    <span className={styles.soonBadge}>준비중</span>
                                </>
                            )}
                        </span>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.active : ''} ${collapsed ? styles.navItemCollapsed : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.Icon className={styles.navIcon} />
                            {!collapsed && item.label}
                        </Link>
                    ),
                )}
            </nav>

            <ProfileDropdown collapsed={collapsed} />
        </aside>
    );
}
