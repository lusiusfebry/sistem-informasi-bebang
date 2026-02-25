import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Building2,
    BadgeCheck,
    Award,
    Plus,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Cake,
    AlertCircle,
    VenetianMask,
    Briefcase,
    ChevronRight,
    Calendar,
    Users2,
    UserPlus,
    UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import api from '@/lib/api';

interface Stats {
    totalKaryawan: number;
    activeKaryawan: number;
    newKaryawanThisMonth: number;
    onboardingCount: number;
    offboardingCount: number;
    karyawanPerDivisi: Array<{ nama: string; jumlah: number }>;
    genderStats: Array<{ gender: string; count: number }>;
    employmentStats: Array<{ nama: string; jumlah: number }>;
    recentKaryawan: Array<{
        id: number;
        nama_lengkap: string;
        nomor_induk_karyawan: string;
        created_at: string;
        posisi_jabatan: { nama: string };
    }>;
    upcomingBirthdays: Array<{
        id: number;
        nama: string;
        foto: string | null;
        tanggal: string;
    }>;
    expiringContracts: Array<{
        id: number;
        nama: string;
        nik: string;
        tanggal_berakhir: string;
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
                <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendValue}%
                    </div>
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
    const [, setIsLoading] = useState(true);
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const maleCount = stats?.genderStats.find(g => g.gender === 'Laki-laki')?.count || 0;
    const femaleCount = stats?.genderStats.find(g => g.gender === 'Perempuan')?.count || 0;
    const totalWithGender = maleCount + femaleCount;

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-lg shadow-primary/20">
                        {user?.nama?.[0] || 'A'}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight leading-tight">
                            Selamat Datang, <span className="text-primary">{user?.nama?.split(' ')[0] || 'Admin'}!</span>
                        </h2>
                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 relative z-10">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/karyawan')}
                        className="h-12 px-6 rounded-2xl font-bold border-muted-foreground/20 hover:bg-white transition-all shadow-sm"
                    >
                        Directory
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/karyawan/tambah')}
                        className="h-12 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Plus className="mr-2 w-5 h-5" />
                        Tambah Karyawan
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <KPICard
                    title="Total Karyawan"
                    value={stats?.totalKaryawan}
                    icon={Users}
                    description="Seluruh tenaga kerja terdaftar"
                    trend="up"
                    trendValue={stats?.newKaryawanThisMonth || 0}
                    color="bg-blue-600"
                />
                <KPICard
                    title="Karyawan Aktif"
                    value={stats?.activeKaryawan}
                    icon={BadgeCheck}
                    description="Kontrak berjalan di site"
                    trend="up"
                    trendValue={0}
                    color="bg-emerald-600"
                />
                <KPICard
                    title="Onboarding"
                    value={stats?.onboardingCount}
                    icon={UserPlus}
                    description="Proses masuk aktif"
                    trend="up"
                    trendValue={0}
                    color="bg-sky-500"
                />
                <KPICard
                    title="Offboarding"
                    value={stats?.offboardingCount}
                    icon={UserMinus}
                    description="Proses keluar aktif"
                    trend="down"
                    trendValue={0}
                    color="bg-rose-500"
                />
                <KPICard
                    title="Posisi Jabatan"
                    value={stats?.masterCount.posisi}
                    icon={Award}
                    description="Varian peran operasional"
                    trend="up"
                    trendValue={0}
                    color="bg-purple-600"
                />
                <KPICard
                    title="Total Divisi"
                    value={stats?.masterCount.divisi}
                    icon={Building2}
                    description="Unit organisasi resmi"
                    trend="up"
                    trendValue={0}
                    color="bg-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analytics Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Donut Chart Style: Karyawan per Divisi */}
                        <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-black tracking-tight uppercase">Distribusi Divisi</CardTitle>
                                    <Building2 className="text-muted-foreground w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {stats?.karyawanPerDivisi.slice(0, 5).map((div, idx) => (
                                        <div key={idx} className="space-y-1.5 group">
                                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                                <span className="truncate max-w-[150px]">{div.nama}</span>
                                                <span className="text-primary">{div.jumlah}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary group-hover:bg-primary/80 transition-all duration-1000"
                                                    style={{ width: `${stats.totalKaryawan > 0 ? (div.jumlah / stats.totalKaryawan) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {(!stats || stats.karyawanPerDivisi.length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary mb-3" />
                                            <p className="text-[10px] font-bold uppercase">No Division Data</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gender & Emp Status Widget */}
                        <div className="grid grid-rows-2 gap-6">
                            {/* Gender Distribution */}
                            <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                                <CardContent className="p-6 h-full flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Distribusi Gender</h4>
                                        <Users2 className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Pria</span>
                                                <span className="font-black">{maleCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500" /> Wanita</span>
                                                <span className="font-black">{femaleCount}</span>
                                            </div>
                                        </div>
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-pink-500" />
                                                <circle
                                                    cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6"
                                                    className="text-blue-500 transition-all duration-1000"
                                                    strokeDasharray={175.9}
                                                    strokeDashoffset={175.9 - (175.9 * (totalWithGender > 0 ? maleCount / totalWithGender : 0))}
                                                />
                                            </svg>
                                            <span className="absolute text-[10px] font-black">{totalWithGender}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Employment Status Summary */}
                            <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                                <CardContent className="p-6 h-full flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status Hubungan Kerja</h4>
                                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {stats?.employmentStats.map((st, i) => (
                                            <TooltipProvider key={i}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2 cursor-default hover:border-primary/30 transition-colors">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-amber-500'}`} />
                                                            <span className="text-[10px] font-bold truncate max-w-[80px]">{st.nama}</span>
                                                            <span className="text-[10px] font-black text-primary">{st.jumlah}</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-bold">{st.nama}: {st.jumlah} Karyawan</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Activities Table */}
                    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-black tracking-tight uppercase">Personel Bergabung Terbaru</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Update data site terkini</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/hr/karyawan')}
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70"
                            >
                                Lihat Semua <ChevronRight className="ml-1 w-3 h-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                            <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Karyawan</th>
                                            <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Jabatan</th>
                                            <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Tanggal</th>
                                            <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {stats?.recentKaryawan.map((karyawan) => (
                                            <tr key={karyawan.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {karyawan.nama_lengkap[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold leading-none mb-1">{karyawan.nama_lengkap}</p>
                                                            <p className="text-[10px] font-medium text-muted-foreground/80 tracking-widest uppercase">{karyawan.nomor_induk_karyawan}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-muted-foreground">{karyawan.posisi_jabatan.nama}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(karyawan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/hr/karyawan/${karyawan.id}`)}
                                                        className="h-8 w-8 p-0 rounded-lg group-hover:bg-primary/5 group-hover:text-primary transition-all"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Section */}
                <div className="space-y-8">
                    {/* Birthdays Widget */}
                    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900 border-t-4 border-amber-500">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black tracking-tight uppercase flex items-center gap-2">
                                    <Cake className="w-4 h-4 text-amber-500" /> Ulang Tahun
                                </CardTitle>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase">Bulan Ini</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-4 space-y-4">
                            {stats?.upcomingBirthdays.map((b, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full ring-2 ring-amber-500/20 bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {b.foto ? <img src={`http://localhost:3000/${b.foto}`} className="w-full h-full object-cover" /> : <Users2 className="w-4 h-4 text-slate-400" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold leading-tight line-clamp-1">{b.nama}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground">{new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                                        HBD!
                                    </div>
                                </div>
                            ))}
                            {(!stats || stats.upcomingBirthdays.length === 0) && (
                                <p className="text-xs text-center text-muted-foreground py-4 font-medium italic">Tidak ada ultah bulan ini</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contract Expiration Widget */}
                    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900 border-t-4 border-rose-500">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black tracking-tight uppercase flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500" /> Kontrak Habis
                                </CardTitle>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-700 uppercase">Taliabu Site</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-4 space-y-4">
                            {stats?.expiringContracts.map((c, i) => (
                                <div key={i} className="space-y-1.5 p-3 rounded-xl bg-rose-50/30 border border-rose-100/50 hover:bg-rose-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/hr/karyawan/${c.id}`)}>
                                    <p className="text-xs font-bold leading-none truncate">{c.nama}</p>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-muted-foreground font-black uppercase tracking-tight">{c.nik}</span>
                                        <span className="text-rose-600 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm">
                                            {new Date(c.tanggal_berakhir).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!stats || stats.expiringContracts.length === 0) && (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <BadgeCheck className="w-10 h-10 text-emerald-500/20 mb-2" />
                                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest text-center px-4 leading-relaxed">Semua kontrak <br /> aman & aktif</p>
                                </div>
                            )}
                        </CardContent>
                        {stats && stats.expiringContracts.length > 0 && (
                            <CardContent className="p-4 pt-0">
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 h-9 rounded-xl">
                                    Proses Mutasi/Pembaruan
                                </Button>
                            </CardContent>
                        )}
                    </Card>

                    {/* Quick Access Card */}
                    <Card className="border-none shadow-lg overflow-hidden bg-primary text-primary-foreground relative group">
                        <div className="absolute top-0 right-0 p-8 rotate-12 translate-x-4 -translate-y-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <VenetianMask className="w-32 h-32" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <h4 className="text-xl font-black mb-1">Butuh Laporan?</h4>
                            <p className="text-xs text-primary-foreground/70 font-medium mb-4">Export data site site secara instan untuk kebutuhan audit.</p>
                            <Button
                                variant="secondary"
                                className="w-full font-bold rounded-xl h-10 shadow-lg shadow-black/10 hover:bg-white"
                                onClick={() => navigate('/hr/karyawan')}
                            >
                                Buka Export Center
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
