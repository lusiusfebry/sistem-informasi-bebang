import {
    LayoutGrid,
    LayoutDashboard,
    Home,
    ClipboardList,
    Wrench,
    Calendar,
    Gem,
    Users,
    FileBarChart,
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import type { NavItem } from './BaseLayout';

const navItems: NavItem[] = [
    { label: 'Portal Utama', icon: LayoutGrid, path: '/welcome' },
    { type: 'section', label: 'MENU MESS' },
    { label: 'Statistik', icon: LayoutDashboard, path: '/mess', end: true },
    { type: 'section', label: 'OPERASIONAL' },
    { label: 'Gedung & Kamar', icon: Home, path: '/mess/gedung' },
    { label: 'Daftar Penghuni', icon: Users, path: '/mess/penghuni' },
    { label: 'Okupansi & Penempatan', icon: ClipboardList, path: '/mess/operasional' },
    { type: 'section', label: 'PEMELIHARAAN' },
    { label: 'Laporan Kerusakan', icon: Wrench, path: '/mess/perawatan' },
    { label: 'Jadwal Kebersihan', icon: Calendar, path: '/mess/cleaning' },
    { type: 'section', label: 'MASTER DATA' },
    { label: 'Daftar Fasilitas', icon: Gem, path: '/mess/master/fasilitas' },
    { label: 'Petugas Mess', icon: Users, path: '/mess/master/petugas' },
    { type: 'section', label: 'LAPORAN' }, // Added LAPORAN section
    { label: 'Laporan Terpadu', icon: FileBarChart, path: '/mess/laporan' }, // Added Laporan Terpadu link
];

const pathMap: Record<string, string> = {
    'gedung': 'Gedung & Kamar',
    'penghuni': 'Daftar Penghuni',
    'operasional': 'Okupansi & Penempatan',
    'perawatan': 'Laporan Kerusakan',
    'cleaning': 'Jadwal Kebersihan',
    'fasilitas': 'Daftar Fasilitas',
    'petugas': 'Petugas Mess',
    'laporan': 'Laporan Terpadu', // Added Laporan Terpadu to pathMap
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
