'use client';

import HeungkukLogo from '@/components/ui/HeungkukLogo';
import { isAdmin } from '@/lib/utils/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { IconType } from 'react-icons';
import {
    BsBarChartFill,
    BsBuildingFillCheck,
    BsCalendarFill,
    BsChevronLeft,
    BsChevronRight,
    BsClipboardCheckFill,
    BsFileEarmarkFill,
    BsGearFill,
    BsHouseDoorFill,
} from 'react-icons/bs';
import { MdRestaurant } from 'react-icons/md';
import ProfileDropdown from './ProfileDropdown';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { label: string; href: string; Icon: IconType; adminOnly: boolean; disabled: boolean; dividerAfter?: boolean }[] = [
    { label: '대시보드', href: '/dashboard', Icon: BsHouseDoorFill, adminOnly: false, disabled: false },
    { label: '일정 현황', href: '/scheduler', Icon: BsCalendarFill, adminOnly: false, disabled: false },
    { label: '예약 관리', href: '/reservation', Icon: BsClipboardCheckFill, adminOnly: false, disabled: false },
    { label: '문서 관리', href: '/document', Icon: BsFileEarmarkFill, adminOnly: true, disabled: false, dividerAfter: true },
    { label: '식수 관리', href: '/restaurant', Icon: MdRestaurant, adminOnly: false, disabled: false },
    { label: '숙박 현황', href: '/accommodation', Icon: BsBuildingFillCheck, adminOnly: false, disabled: false },
    { label: '설문 관리', href: '/survey', Icon: BsBarChartFill, adminOnly: false, disabled: false, dividerAfter: true },
    { label: '설정', href: '/settings', Icon: BsGearFill, adminOnly: true, disabled: false },
];

interface Props {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
    const pathname = usePathname();
    const admin = isAdmin();

    const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || admin);

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.logo}>
                {!collapsed && (
                    <span className={styles.logoIconWrap}>
                        <HeungkukLogo size={36} />
                    </span>
                )}
                {!collapsed && (
                    <div className={styles.logoTextWrap}>
                        <div className={styles.logoName}>흥국생명연수원</div>
                        <div className={styles.logoSub}>대관 관리</div>
                    </div>
                )}
                <button className={styles.toggleBtn} onClick={onToggle} title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}>
                    {collapsed ? <BsChevronRight /> : <BsChevronLeft />}
                </button>
            </div>

            <nav className={styles.nav}>
                {visibleItems.map((item, idx) =>
                    item.disabled ? (
                        <Fragment key={item.href}>
                            <span
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
                            {item.dividerAfter && idx < visibleItems.length - 1 && (
                                <div className={styles.navDivider} />
                            )}
                        </Fragment>
                    ) : (
                        <Fragment key={item.href}>
                            <Link
                                href={item.href}
                                className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.active : ''} ${collapsed ? styles.navItemCollapsed : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.Icon className={styles.navIcon} />
                                {!collapsed && item.label}
                            </Link>
                            {item.dividerAfter && idx < visibleItems.length - 1 && (
                                <div className={styles.navDivider} />
                            )}
                        </Fragment>
                    ),
                )}
            </nav>

            <ProfileDropdown collapsed={collapsed} />
        </aside>
    );
}
