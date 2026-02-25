import {
    ShieldCheck,
    UserCog,
    Key,
    Lock
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import type { NavItem } from './BaseLayout';

const navItems: NavItem[] = [
    { label: 'Dashboard', icon: ShieldCheck, path: '/access', end: true },
    { type: 'section', label: 'KEAMANAN' },
    { label: 'Manajemen User', icon: UserCog, path: '/access/users' },
    { label: 'Role & Izin', icon: Key, path: '/access/roles', disabled: true },
    { label: 'Log Aktivitas', icon: Lock, path: '/access/logs', disabled: true },
];

const pathMap: Record<string, string> = {
    'users': 'Manajemen User',
    'roles': 'Role & Izin',
    'logs': 'Log Aktivitas',
};

export default function AccessLayout() {
    return (
        <BaseLayout
            moduleTitle="ACCESS"
            navItems={navItems}
            pathMap={pathMap}
            modulePath="access"
        />
    );
}
