import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Building2,
    BadgeCheck,
    Award,
    Plus,
    TrendingUp,
    Clock,
    UserPlus,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

interface Stats {
    totalKaryawan: number;
    activeKaryawan: number;
    karyawanPerDivisi: Array<{ nama: string; jumlah: number }>;
    recentKaryawan: Array<{
        id: number;
        nama_lengkap: string;
        nomor_induk_karyawan: string;
        created_at: string;
        posisi_jabatan: { nama: string };
    }>;
    masterCount: {
        divisi: number;
        posisi: number;
        golongan: number;
    }
}

interface KPICardProps {
    title: string;
    value?: number;
    icon: ElementType;
    description: string;
    trend: 'up' | 'down';
    trendValue: number;
    color: string;
}

const KPICard = ({ title, value, icon: Icon, description, trend, trendValue, color }: KPICardProps) => (
    <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trendValue}%
                </div>
            </div>
            <div>
                <CardTitle className="text-3xl font-black tracking-tight mb-1">
                    {value === undefined ? <Skeleton className="h-9 w-16" /> : value}
                </CardTitle>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-2">{description}</p>
            </div>
        </CardContent>
    </Card>
);

export default function HRDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [user] = useState<{ nama: string; role: string } | null>(() => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, masterDiv, masterPos, masterGol] = await Promise.all([
                    api.get('/karyawan/stats'),
                    api.get('/master/divisi'),
                    api.get('/master/posisi-jabatan'),
                    api.get('/master/golongan')
                ]);

                setStats({
                    ...statsRes.data,
                    masterCount: {
                        divisi: masterDiv.data.length,
                        posisi: masterPos.data.length,
                        golongan: masterGol.data.length
                    }
                });
            } catch (error) {
                console.error('Fetch dashboard stats error:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                        Selamat Datang, <span className="text-primary">{user?.nama?.split(' ')[0] || 'Admin'}!</span>
                    </h2>
                    <p className="text-muted-foreground font-medium italic">PT Prima Sarana Gemilang - Site Taliabu</p>
                </div>
                <Button
                    onClick={() => navigate('/hr/karyawan/tambah')}
                    className="relative z-10 h-12 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <Plus className="mr-2 w-5 h-5" />
                    Tambah Karyawan
                </Button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Divisi"
                    value={stats?.masterCount.divisi}
                    icon={Building2}
                    description="Struktur organisasi aktif"
                    trend="up"
                    trendValue={0}
                    color="bg-blue-600"
                />
                <KPICard
                    title="Posisi Jabatan"
                    value={stats?.masterCount.posisi}
                    icon={BadgeCheck}
                    description="Varian peran di site"
                    trend="up"
                    trendValue={0}
                    color="bg-purple-600"
                />
                <KPICard
                    title="Total Golongan"
                    value={stats?.masterCount.golongan}
                    icon={Award}
                    description="Klasifikasi pangkat"
                    trend="up"
                    trendValue={0}
                    color="bg-amber-600"
                />
                <KPICard
                    title="Karyawan Aktif"
                    value={stats?.activeKaryawan}
                    icon={Users}
                    description="Total tenaga kerja site"
                    trend="up"
                    trendValue={0}
                    color="bg-emerald-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart Mockup */}
                <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
                    <CardHeader className="border-b bg-muted/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight">Pertumbuhan Karyawan</CardTitle>
                                <CardDescription className="font-medium">Data 6 bulan terakhir</CardDescription>
                            </div>
                            <TrendingUp className="text-primary w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex items-end justify-between h-48 gap-4 px-4">
                            {[45, 62, 58, 75, 82, 95].map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary transition-all duration-500 relative"
                                        style={{ height: `${val}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {val + 400}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-muted-foreground">Month {idx + 1}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Donut Chart Mockup */}
                <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="border-b bg-muted/10">
                        <CardTitle className="text-lg font-black tracking-tight">Karyawan per Divisi</CardTitle>
                        <CardDescription className="font-medium">Distribusi departemen</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center">
                        <div className="w-full space-y-4">
                            {stats?.karyawanPerDivisi.map((div, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                                        <span>{div.nama}</span>
                                        <span>{div.jumlah}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000"
                                            style={{ width: `${stats.totalKaryawan > 0 ? (div.jumlah / stats.totalKaryawan) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!stats || stats.karyawanPerDivisi.length === 0) && (
                                <p className="text-xs text-center text-muted-foreground font-medium italic">Belum ada data divisi</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="border-b bg-muted/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight">Aktivitas Data Terbaru</CardTitle>
                            <CardDescription className="font-medium">Otomatisasi log sistem HR</CardDescription>
                        </div>
                        <Clock className="text-muted-foreground w-5 h-5" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Tipe Data</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Deskripsi</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Oleh</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Waktu</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {stats?.recentKaryawan.map((karyawan) => (
                                    <tr key={karyawan.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/hr/karyawan/${karyawan.id}`)}>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-blue-100 text-blue-700">
                                                <UserPlus className="inline mr-1 w-3 h-3" />
                                                Karyawan
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">Bergabungnya {karyawan.nama_lengkap} ({karyawan.nomor_induk_karyawan})</td>
                                        <td className="px-6 py-4 text-sm font-bold text-muted-foreground">{karyawan.posisi_jabatan.nama}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-muted-foreground/60">{new Date(karyawan.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                                Baru
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats || stats.recentKaryawan.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-muted-foreground italic">Belum ada aktivitas terbaru</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
