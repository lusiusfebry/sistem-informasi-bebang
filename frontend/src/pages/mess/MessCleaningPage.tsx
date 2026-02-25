import { useState, useEffect, useCallback } from 'react';
import {
    Calendar,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import api from '@/lib/api';

interface CleaningSchedule {
    id: number;
    room_id: number;
    tanggal_jadwal: string;
    status: string;
    catatan: string | null;
    room: { nomor_kamar: string; mess: { nama: string } };
}

interface Room {
    id: number;
    nomor_kamar: string;
    mess: { nama: string };
}

export default function MessCleaningPage() {
    const [schedules, setSchedules] = useState<CleaningSchedule[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        room_id: 0,
        tanggal_jadwal: '',
        catatan: ''
    });

    const fetchSchedules = useCallback(async () => {
        try {
            const response = await api.get(`/mess/cleaning/schedules?search=${search}`);
            setSchedules(response.data);
        } catch {
            toast.error('Gagal mengambil jadwal kebersihan');
        }
    }, [search]);

    const fetchRooms = useCallback(async () => {
        try {
            const response = await api.get('/mess/rooms/all'); // Need to ensure this endpoint exists or use others
            setRooms(response.data);
        } catch {
            // Fallback to fetching mess then rooms if specific all-rooms endpoint fails
            try {
                const messRes = await api.get('/mess');
                const allRooms: Room[] = [];
                for (const m of messRes.data) {
                    const roomRes = await api.get(`/mess/${m.id}/rooms`);
                    allRooms.push(...roomRes.data.map((r: { id: number; nomor_kamar: string }) => ({ ...r, mess: { nama: m.nama } })));
                }
                setRooms(allRooms);
            } catch {
                toast.error('Gagal mengambil data kamar');
            }
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
        fetchRooms();
    }, [fetchSchedules, fetchRooms]);

    const handleCreate = async () => {
        if (!form.room_id || !form.tanggal_jadwal) {
            toast.error('Kamar dan Tanggal harus diisi');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/mess/cleaning/schedules', form);
            toast.success('Jadwal kebersihan berhasil dibuat');
            setShowModal(false);
            fetchSchedules();
        } catch {
            toast.error('Gagal membuat jadwal');
        } finally {
            setIsLoading(true);
        }
    };

    const handleConfirm = async (id: number) => {
        try {
            await api.put(`/mess/cleaning/schedules/${id}/status`, { status: 'Selesai' });
            toast.success('Kebersihan telah dikonfirmasi');
            fetchSchedules();
        } catch {
            toast.error('Gagal memperbarui status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                        <Calendar className="w-6 h-6 text-primary" />
                        Jadwal Kebersihan
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Monitoring dan pembuatan jadwal sanitasi rutin.</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Buat Jadwal
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 border-none shadow-md h-fit">
                    <CardHeader className="pb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Filter</CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari mess/kamar..."
                                className="pl-9 text-xs"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-4">
                    {schedules.length > 0 ? schedules.map((s) => (
                        <Card key={s.id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row">
                                <div className={`w-2 sm:w-16 flex items-center justify-center ${s.status === 'Selesai' ? 'bg-emerald-500' : 'bg-primary'}`}>
                                    <Calendar className="w-5 h-5 text-white hidden sm:block" />
                                </div>
                                <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0">
                                            <Home className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-black uppercase">{s.room.mess.nama} • Kamar {s.room.nomor_kamar}</h3>
                                                <Badge variant={s.status === 'Selesai' ? 'success' : 'secondary'} className="text-[9px] uppercase font-bold">
                                                    {s.status === 'Selesai' ? 'Selesai' : 'Menunggu'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(s.tanggal_jadwal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                                {s.catatan && <span className="truncate max-w-[200px]">Note: {s.catatan}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.status !== 'Selesai' && (
                                            <Button size="sm" className="font-bold gap-2" onClick={() => handleConfirm(s.id)}>
                                                <CheckCircle2 className="w-4 h-4" /> Konfirmasi Selesai
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="h-[200px] flex flex-col items-center justify-center bg-muted/20 rounded-3xl border-2 border-dashed border-muted font-bold text-muted-foreground italic">
                            Tidak ada jadwal kebersihan saat ini.
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Jadwal Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Kamar</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                value={form.room_id}
                                onChange={e => setForm({ ...form, room_id: Number(e.target.value) })}
                            >
                                <option value={0}>Pilih Kamar</option>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.mess.nama} - {r.nomor_kamar}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Tanggal Jadwal</label>
                            <Input
                                type="date"
                                value={form.tanggal_jadwal}
                                onChange={e => setForm({ ...form, tanggal_jadwal: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Catatan</label>
                            <Input
                                placeholder="Misal: Bersihkan AC, Tambah bantal"
                                value={form.catatan}
                                onChange={e => setForm({ ...form, catatan: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading}>Batal</Button>
                        <Button onClick={handleCreate} disabled={isLoading}>Simpan Jadwal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
