import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Users,
    Building2,
    Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Resident {
    id: number;
    nama_lengkap: string;
    nomor_induk_karyawan: string;
    mess_room: {
        nomor_kamar: string;
        mess: {
            nama: string;
        };
    };
    created_at: string;
    status_proses: string;
}

interface Mess {
    id: number;
    nama: string;
}

export default function MessResidentPage() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [messList, setMessList] = useState<Mess[]>([]);
    const [search, setSearch] = useState('');
    const [selectedMess, setSelectedMess] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    const fetchResidents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/mess/residents/current');
            setResidents(response.data);
        } catch {
            toast.error('Gagal mengambil data penghuni');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMessList = useCallback(async () => {
        try {
            const response = await api.get('/mess');
            setMessList(response.data);
        } catch {
            toast.error('Gagal mengambil data mess');
        }
    }, []);

    useEffect(() => {
        fetchResidents();
        fetchMessList();
    }, [fetchResidents, fetchMessList]);

    const filteredResidents = residents.filter(r => {
        const matchesSearch = r.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
            r.nomor_induk_karyawan.toLowerCase().includes(search.toLowerCase()) ||
            r.mess_room.nomor_kamar.toLowerCase().includes(search.toLowerCase());

        const matchesMess = selectedMess === 'all' || r.mess_room.mess.nama === selectedMess;

        return matchesSearch && matchesMess;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                        <Users className="w-6 h-6 text-primary" />
                        Daftar Penghuni Mess
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Data seluruh karyawan yang aktif menempati mess.</p>
                </div>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama, NIK, atau nomor kamar..."
                                className="pl-9 bg-white dark:bg-slate-900"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <select
                                className="h-10 px-3 rounded-md border border-input bg-background text-sm font-bold uppercase"
                                value={selectedMess}
                                onChange={(e) => setSelectedMess(e.target.value)}
                            >
                                <option value="all">Semua Mess</option>
                                {messList.map(m => (
                                    <option key={m.id} value={m.nama}>{m.nama}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-muted/5 border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Penghuni</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Lokasi Mess</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Kamar</th>
                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground font-bold animate-pulse italic">
                                            Memuat data penghuni...
                                        </td>
                                    </tr>
                                ) : filteredResidents.length > 0 ? filteredResidents.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                                                    {r.nama_lengkap.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black uppercase text-slate-900 dark:text-slate-100">{r.nama_lengkap}</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{r.nomor_induk_karyawan}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                                <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{r.mess_room.mess.nama}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="font-black rounded-lg border-primary/20 bg-primary/5 text-primary">
                                                {r.mess_room.nomor_kamar}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Badge variant="success" className="text-[9px] font-black uppercase tracking-tighter">
                                                {r.status_proses}
                                            </Badge>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground font-bold italic">
                                            Tidak ada penghuni yang ditemukan.
                                        </td>
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
