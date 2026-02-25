import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Room {
    id: number;
    penghuni: { id: number }[];
    kapasitas: number;
}

interface DamageReport {
    status: string;
}

export default function MessDashboard() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
    // const [loading, setLoading] = useState(true); // Reserved for future use

    const fetchData = useCallback(async () => {
        try {
            const [roomsRes, damageRes] = await Promise.all([
                api.get('/mess/rooms/all'),
                api.get('/mess/damage-reports/all')
            ]);
            setRooms(roomsRes.data);
            setDamageReports(damageRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data statistik');
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    const totalPenghuni = rooms.reduce((acc, r) => acc + (r.penghuni?.length || 0), 0);
    const totalKapasitas = rooms.reduce((acc, r) => acc + r.kapasitas, 0);
    const occupancyRate = totalKapasitas > 0 ? Math.round((totalPenghuni / totalKapasitas) * 100) : 0;
    const activeReports = damageReports.filter(r => r.status !== 'Selesai').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">Statistik Hunian</h1>
                    <p className="text-muted-foreground text-sm font-medium">Ringkasan operasional mess site Taliabu.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-primary text-primary-foreground">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold uppercase opacity-70">Total Hunian</p>
                        <h3 className="text-4xl font-black mt-2">{totalPenghuni}</h3>
                        <p className="text-[10px] mt-2 font-medium opacity-80">Dari total {totalKapasitas} kapasitas tersedia.</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-amber-500 text-white">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold uppercase opacity-70">Kamar Butuh Perhatian</p>
                        <h3 className="text-4xl font-black mt-2">{activeReports}</h3>
                        <p className="text-[10px] mt-2 font-medium opacity-80">Laporan kerusakan yang sedang diproses.</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-slate-900 text-white">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold uppercase opacity-70">Rerata Okupansi</p>
                        <h3 className="text-4xl font-black mt-2">{occupancyRate}%</h3>
                        <p className="text-[10px] mt-2 font-medium opacity-80">Persentase hunian di seluruh area.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
