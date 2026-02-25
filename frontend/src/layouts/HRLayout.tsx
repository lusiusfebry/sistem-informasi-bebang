import {
    LayoutDashboard,
    Building2,
    DoorOpen,
    BadgeCheck,
    Award,
    Layers,
    Star,
    Handshake,
    ToggleLeft,
    MapPin,
    Tag,
    Users,
    UserPlus,
    UserMinus
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import type { NavItem } from './BaseLayout';

const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/hr', end: true },
    { type: 'section', label: 'MASTER DATA' },
    { label: 'Divisi', icon: Building2, path: '/hr/master/divisi' },
    { label: 'Departemen', icon: DoorOpen, path: '/hr/master/departemen' },
    { label: 'Posisi Jabatan', icon: BadgeCheck, path: '/hr/master/posisi-jabatan' },
    { label: 'Golongan', icon: Award, path: '/hr/master/golongan' },
    { label: 'Sub Golongan', icon: Layers, path: '/hr/master/sub-golongan' },
    { label: 'Kategori Pangkat', icon: Star, path: '/hr/master/kategori-pangkat' },
    { label: 'Jenis Hub. Kerja', icon: Handshake, path: '/hr/master/jenis-hubungan-kerja' },
    { label: 'Status Karyawan', icon: ToggleLeft, path: '/hr/master/status-karyawan' },
    { label: 'Lokasi Kerja', icon: MapPin, path: '/hr/master/lokasi-kerja' },
    { label: 'Tag', icon: Tag, path: '/hr/master/tag' },
    { type: 'section', label: 'MANAJEMEN' },
    { label: 'Karyawan', icon: Users, path: '/hr/karyawan' },
    { label: 'Onboarding', icon: UserPlus, path: '/hr/onboarding' },
    { label: 'Offboarding', icon: UserMinus, path: '/hr/offboarding' },
];

const pathMap: Record<string, string> = {
    'master': 'Master Data',
    'divisi': 'Divisi',
    'departemen': 'Departemen',
    'posisi-jabatan': 'Posisi Jabatan',
    'golongan': 'Golongan',
    'sub-golongan': 'Sub Golongan',
    'kategori-pangkat': 'Kategori Pangkat',
    'jenis-hubungan-kerja': 'Jenis Hub. Kerja',
    'status-karyawan': 'Status Karyawan',
    'lokasi-kerja': 'Lokasi Kerja',
    'tag': 'Tag',
    'karyawan': 'Data Karyawan',
    'tambah': 'Tambah Karyawan',
    'onboarding': 'Onboarding Tracker',
    'offboarding': 'Offboarding Tracker',
};

export default function HRLayout() {
    return (
        <BaseLayout
            moduleTitle="HR"
            navItems={navItems}
            pathMap={pathMap}
            modulePath="hr"
        />
    );
}
