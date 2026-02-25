import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    UserMinus,
    Loader2,
    Filter,
    MoreHorizontal,
    AlertTriangle,
    Clock,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/lib/api';
import { toast } from 'sonner';

interface OffboardingItem {
    id: number;
    nama_lengkap: string;
    nomor_induk_karyawan: string;
    updated_at: string;
    progress: number;
    divisi?: { nama: string };
    department?: { nama: string };
    posisi_jabatan?: { nama: string };
}

export default function OffboardingTracker() {
    const navigate = useNavigate();
    const [data, setData] = useState<OffboardingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page] = useState(1);

    const fetchOffboarding = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/karyawan/offboarding/list', {
                params: { search, page }
            });
            setData(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data offboarding');
        } finally {
            setIsLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOffboarding();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchOffboarding]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic text-rose-600">Offboarding Tracker</h1>
                    <p className="text-muted-foreground text-sm font-medium">Monitoring proses pengunduran diri & terminasi</p>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari Nama atau NIK..."
                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                                <Filter className="w-4 h-4 mr-2" /> Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
                            <p className="text-sm font-bold text-muted-foreground italic">Menyiapkan data offboarding...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <UserMinus className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold">Tidak ada data offboarding</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                Saat ini tidak ada karyawan yang sedang dalam proses resign atau offboarding.
                                Untuk memulai proses, silakan pilih karyawan dari menu <strong>Data Karyawan</strong>.
                            </p>
                            <Button variant="outline" onClick={() => navigate('/hr/karyawan')} className="rounded-xl font-bold">
                                Ke Data Karyawan
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 pointer-events-none">
                                <TableRow className="border-none">
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Karyawan</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Jabatan & Divisi</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Terakhir Update</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Status Progress</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer group" onClick={() => navigate(`/hr/karyawan/${item.id}`)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold shadow-sm">
                                                    {item.nama_lengkap[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold group-hover:text-rose-600 transition-colors">{item.nama_lengkap}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{item.nomor_induk_karyawan}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary" className="w-fit text-[10px] font-bold py-0 h-5 border-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                                                    {item.posisi_jabatan?.nama || '-'}
                                                </Badge>
                                                <p className="text-[10px] font-bold text-muted-foreground/60 pl-1 uppercase">{item.divisi?.nama || '-'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(item.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] font-black uppercase ${item.progress === 100 ? 'text-rose-600' : 'text-slate-500'}`}>
                                                        {item.progress === 100 ? 'Siap Checkout' : 'Proses Pencapaian'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-rose-600 italic">Target Keluar</span>
                                                </div>
                                                <Progress value={item.progress} className="h-1.5 rounded-full bg-rose-100" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-slate-200 dark:border-slate-800">
                                                    <DropdownMenuItem onClick={() => navigate(`/hr/karyawan/${item.id}`)} className="rounded-xl font-bold py-2 px-3 focus:bg-rose-50 cursor-pointer">
                                                        <AlertTriangle className="w-4 h-4 mr-3 text-rose-500" /> Selesaikan Checklist
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/hr/karyawan/${item.id}`)} className="rounded-xl font-bold py-2 px-3 focus:bg-slate-50 cursor-pointer">
                                                        <ShieldAlert className="w-4 h-4 mr-3 text-slate-500" /> Akses & Mess
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
