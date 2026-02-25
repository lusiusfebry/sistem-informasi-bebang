import {
    LayoutDashboard,
    Home,
    ClipboardList,
    Wrench,
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import type { NavItem } from './BaseLayout';

const navItems: NavItem[] = [
    { label: 'Statistik', icon: LayoutDashboard, path: '/mess', end: true },
    { type: 'section', label: 'OPERASIONAL' },
    { label: 'Data Mess & Kamar', icon: Home, path: '/mess/gedung' },
    { label: 'Okupansi & Penempatan', icon: ClipboardList, path: '/mess/operasional' },
    { label: 'Perawatan & Kebersihan', icon: Wrench, path: '/mess/perawatan' },
];

const pathMap: Record<string, string> = {
    'gedung': 'Data Mess & Kamar',
    'operasional': 'Okupansi & Penempatan',
    'perawatan': 'Perawatan & Kebersihan',
};

export default function MessLayout() {
    return (
        <BaseLayout
            moduleTitle="MESS"
            navItems={navItems}
            pathMap={pathMap}
            modulePath="mess"
        />
    );
}
