import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LogOut,
    Gem,
    Menu,
    Bell,
    HelpCircle,
    ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export type NavItem = {
    label: string;
    icon?: LucideIcon;
    path?: string;
    type?: 'section' | 'item';
    end?: boolean;
    adminOnly?: boolean;
    disabled?: boolean;
}

interface BaseLayoutProps {
    moduleTitle: string;
    navItems: NavItem[];
    pathMap: Record<string, string>;
    modulePath: string; // e.g., 'hr', 'mess', 'access'
}

export default function BaseLayout({ moduleTitle, navItems, pathMap, modulePath }: BaseLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user] = useState<{ nama: string; roles: string[]; nik: string } | null>(() => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        toast.success('Berhasil keluar dari sistem');
        navigate('/login');
    };

    const breadcrumbs = location.pathname
        .split('/')
        .filter(p => p && p !== modulePath)
        .map(p => pathMap[p] || p);

    return (
        <div className="flex h-screen bg-slate-50/50 dark:bg-slate-950 overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Gem className="text-primary-foreground w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter leading-none italic uppercase">BEBANG <span className="text-primary tracking-normal">{moduleTitle}</span></h1>
                        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">Site Taliabu</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
                    {navItems.map((item, idx) => {
                        if (item.type === 'section') {
                            return (
                                <div key={idx} className="pt-4 pb-1">
                                    <p className="px-3 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                                        {item.label}
                                    </p>
                                </div>
                            );
                        }
                        const Icon = item.icon;

                        // Role-based filtering
                        if (item.adminOnly && !user?.roles?.some(r => r.toLowerCase().includes('admin'))) {
                            return null;
                        }

                        if (item.disabled) {
                            return (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed grayscale text-muted-foreground"
                                >
                                    {Icon && <Icon className="w-5 h-5" />}
                                    {item.label}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={idx}
                                to={item.path!}
                                end={item.end}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                                `}
                            >
                                {Icon && <Icon className="w-5 h-5" />}
                                {item.label}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Sidebar Footer */}
                {user && (
                    <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {user.nama.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate leading-none mb-1">{user.nama}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase truncate">
                                    {user.roles?.join(', ') || 'No Role'} • {user.nik}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="rounded-xl hover:bg-destructive/10 hover:text-destructive shrink-0"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/welcome')}>Portal</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-foreground">{moduleTitle === 'HR' ? 'Human Resources' : moduleTitle === 'MESS' ? 'Mess Management' : 'Access Control'}</span>
                            {breadcrumbs.map((crumb, idx) => (
                                <span key={idx} className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4" />
                                    <span className={idx === breadcrumbs.length - 1 ? "text-primary tracking-tight font-black" : "text-foreground"}>
                                        {crumb}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                            <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                {/* Content Outlet */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
