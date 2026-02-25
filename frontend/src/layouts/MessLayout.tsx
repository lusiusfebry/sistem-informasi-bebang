import {
    LayoutDashboard,
    Home,
    ClipboardList,
    Wrench,
    Calendar,
    Gem,
    Users,
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import type { NavItem } from './BaseLayout';

const navItems: NavItem[] = [
    { label: 'Statistik', icon: LayoutDashboard, path: '/mess', end: true },
    { type: 'section', label: 'OPERASIONAL' },
    { label: 'Gedung & Kamar', icon: Home, path: '/mess/gedung' },
    { label: 'Okupansi & Penempatan', icon: ClipboardList, path: '/mess/operasional' },
    { type: 'section', label: 'PEMELIHARAAN' },
    { label: 'Laporan Kerusakan', icon: Wrench, path: '/mess/perawatan' },
    { label: 'Jadwal Kebersihan', icon: Calendar, path: '/mess/cleaning' },
    { type: 'section', label: 'MASTER DATA' },
    { label: 'Daftar Fasilitas', icon: Gem, path: '/mess/master/fasilitas' },
    { label: 'Petugas Mess', icon: Users, path: '/mess/master/petugas' },
];

const pathMap: Record<string, string> = {
    'gedung': 'Gedung & Kamar',
    'operasional': 'Okupansi & Penempatan',
    'perawatan': 'Laporan Kerusakan',
    'cleaning': 'Jadwal Kebersihan',
    'fasilitas': 'Daftar Fasilitas',
    'petugas': 'Petugas Mess',
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
