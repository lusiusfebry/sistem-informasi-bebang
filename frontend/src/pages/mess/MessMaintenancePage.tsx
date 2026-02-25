import { useState, useEffect, useCallback } from 'react';
import { Wrench, Calendar, AlertCircle, Plus, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

interface DamageReport {
    id: number;
    kategori: string | null;
    deskripsi: string;
    status: string;
    tanggal_laporan: string;
    room?: { nomor_kamar: string; mess: { nama: string } };
}

interface CleaningSchedule {
    id: number;
    tanggal_jadwal: string;
    status: string;
    catatan: string | null;
    room?: { nomor_kamar: string; mess: { nama: string } };
}

export default function MessMaintenancePage() {
    const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
    const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const [damageRes, cleaningRes] = await Promise.all([
                api.get('/mess/damage-reports/all'),
                api.get('/mess/cleaning/schedules')
            ]);
            setDamageReports(damageRes.data);
            setCleaningSchedules(cleaningRes.data);
        } catch {
            toast.error('Gagal mengambil data perawatan');
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    const updateDamageStatus = async (id: number, status: string) => {
        try {
            await api.put(`/mess/damage-reports/${id}/status`, { status });
            toast.success('Status laporan diperbarui');
            fetchData();
        } catch {
            toast.error('Gagal memperbarui status');
        }
    };

    const updateCleaningStatus = async (id: number, status: string) => {
        try {
            await api.put(`/mess/cleaning/schedules/${id}/status`, { status });
            toast.success('Status kebersihan diperbarui');
            fetchData();
        } catch {
            toast.error('Gagal memperbarui status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                        <Wrench className="w-6 h-6 text-primary" />
                        Perawatan & Kebersihan
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Pengelolaan kerusakan fasilitas dan jadwal sanitasi.</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5 font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Laporan Baru
                    </Button>
                    <Button size="sm" className="font-bold">
                        <Calendar className="w-4 h-4 mr-2" /> Buat Jadwal
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* DAMAGE REPORTS */}
                <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-rose-50/50 dark:bg-rose-950/10 border-b border-rose-100 dark:border-rose-900/50">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            <CardTitle className="text-lg font-black tracking-tight uppercase">Laporan Kerusakan</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-bold uppercase text-rose-600/70">Daftar keluhan fasilitas dari penghuni mess.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {damageReports.length > 0 ? damageReports.map((r) => (
                                <div key={r.id} className="p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] bg-white font-black">{r.room?.mess.nama} • {r.room?.nomor_kamar}</Badge>
                                            <Badge variant={r.status === 'Selesai' ? 'success' : r.status === 'Proses' ? 'secondary' : 'destructive'} className="text-[9px]">
                                                {r.status}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-medium">{new Date(r.tanggal_laporan).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <h4 className="text-sm font-black uppercase mb-1">{r.kategori || 'Fasilitas Umum'}</h4>
                                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{r.deskripsi}</p>
                                    <div className="flex items-center gap-2">
                                        {r.status !== 'Selesai' && (
                                            <>
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold" onClick={() => updateDamageStatus(r.id, 'Proses')}>Tangani</Button>
                                                <Button size="sm" className="h-7 text-[10px] font-bold" onClick={() => updateDamageStatus(r.id, 'Selesai')}>Selesaikan</Button>
                                            </>
                                        )}
                                        {r.status === 'Selesai' && (
                                            <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                <Info className="w-3 h-3" /> Perbaikan telah selesai dilakukan
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center">
                                    <AlertCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-muted-foreground">Tidak ada laporan kerusakan aktif.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* CLEANING SCHEDULES */}
                <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-sky-50/50 dark:bg-sky-950/10 border-b border-sky-100 dark:border-sky-900/50">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-sky-500" />
                            <CardTitle className="text-lg font-black tracking-tight uppercase">Jadwal Kebersihan</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-bold uppercase text-sky-600/70">Koordinasi pembersihan rutin kamar mess.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {cleaningSchedules.length > 0 ? cleaningSchedules.map((s) => (
                                <div key={s.id} className="p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="text-[10px] bg-white font-black">{s.room?.mess.nama} • {s.room?.nomor_kamar}</Badge>
                                        <Badge variant={s.status === 'Selesai' ? 'success' : 'secondary'} className="text-[9px]">
                                            {s.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Tanggal Jadwal</p>
                                            <p className="text-xs font-black">{new Date(s.tanggal_jadwal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    {s.catatan && <p className="text-xs text-muted-foreground mb-4 bg-muted/50 p-2 rounded italic">"{s.catatan}"</p>}
                                    {s.status !== 'Selesai' && (
                                        <Button size="sm" className="h-7 text-[10px] font-bold w-full sm:w-auto" onClick={() => updateCleaningStatus(s.id, 'Selesai')}>Konfirmasi Selesai</Button>
                                    )}
                                </div>
                            )) : (
                                <div className="p-12 text-center">
                                    <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-muted-foreground">Tidak ada jadwal kebersihan mendatang.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
