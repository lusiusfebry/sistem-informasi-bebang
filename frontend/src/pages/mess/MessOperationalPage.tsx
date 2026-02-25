import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Mess {
    id: number;
    nama: string;
    lokasi_kerja?: { nama: string };
}

interface Room {
    id: number;
    mess_id: number;
    nomor_kamar: string;
    kapasitas: number;
    penghuni: { id: number }[];
}

export default function MessOperationalPage() {
    const [messList, setMessList] = useState<Mess[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const [messRes, roomsRes] = await Promise.all([
                api.get('/mess'),
                api.get('/mess/rooms/all')
            ]);
            setMessList(messRes.data);
            setRooms(roomsRes.data);
        } catch {
            toast.error('Gagal mengambil data operasional');
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                    <ClipboardList className="w-6 h-6 text-primary" />
                    Okupansi & Penempatan
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Monitoring ketersediaan dan hunian kamar secara real-time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messList.map(m => {
                    const messRooms = rooms.filter(r => r.mess_id === m.id);
                    const totalKapasitas = messRooms.reduce((acc, r) => acc + r.kapasitas, 0);
                    const totalPenghuni = messRooms.reduce((acc, r) => acc + r.penghuni.length, 0);
                    const persentase = totalKapasitas > 0 ? (totalPenghuni / totalKapasitas) * 100 : 0;

                    return (
                        <Card key={m.id} className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900 transition-all hover:scale-[1.02]">
                            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary rounded-lg shadow-sm">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-sm font-black uppercase truncate">{m.nama}</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase">{m.lokasi_kerja?.nama}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Status Hunian</p>
                                        <p className="text-xl font-black text-primary">{totalPenghuni} <span className="text-sm text-muted-foreground font-bold">/ {totalKapasitas}</span></p>
                                    </div>
                                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">{Math.round(persentase)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${persentase > 90 ? 'bg-rose-500' : persentase > 70 ? 'bg-amber-500' : 'bg-primary'}`}
                                        style={{ width: `${persentase}%` }}
                                    />
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Total Kamar</p>
                                        <p className="text-sm font-black">{messRooms.length}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Tersedia</p>
                                        <p className="text-sm font-black text-emerald-500">{totalKapasitas - totalPenghuni}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
