import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    UserPlus,
    Loader2,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    User
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

interface OnboardingItem {
    id: number;
    nama_lengkap: string;
    nomor_induk_karyawan: string;
    created_at: string;
    progress: number;
    divisi?: { nama: string };
    department?: { nama: string };
    posisi_jabatan?: { nama: string };
}

export default function OnboardingTracker() {
    const navigate = useNavigate();
    const [data, setData] = useState<OnboardingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page] = useState(1);

    const fetchOnboarding = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/karyawan/onboarding/list', {
                params: { search, page }
            });
            setData(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data onboarding');
        } finally {
            setIsLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOnboarding();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchOnboarding]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic">Onboarding Tracker</h1>
                    <p className="text-muted-foreground text-sm font-medium">Monitoring proses masuk karyawan baru site Taliabu</p>
                </div>
                <Button onClick={() => navigate('/hr/karyawan/tambah')} className="rounded-2xl font-bold shadow-lg shadow-primary/20">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Karyawan Baru
                </Button>
            </div>

            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari Nama atau NIK..."
                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
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
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-sm font-bold text-muted-foreground italic">Menyiapkan data onboarding...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <User className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold">Tidak ada data onboarding</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">Semua karyawan baru telah menyelesaikan proses atau tidak ada data yang ditemukan.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 pointer-events-none">
                                <TableRow className="border-none">
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Karyawan</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Jabatan & Divisi</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Tanggal Join</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Status Progress</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer group" onClick={() => navigate(`/hr/karyawan/${item.id}`)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                                    {item.nama_lengkap[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.nama_lengkap}</p>
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
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] font-black uppercase ${item.progress === 100 ? 'text-emerald-500' : 'text-primary'}`}>
                                                        {item.progress === 100 ? 'Siap Aktif' : 'Sedang Diproses'}
                                                    </span>
                                                    <span className="text-[10px] font-black">{item.progress}%</span>
                                                </div>
                                                <Progress value={item.progress} className={`h-1.5 rounded-full ${item.progress === 100 ? 'bg-emerald-100' : 'bg-primary/10'}`} />
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
                                                    <DropdownMenuItem onClick={() => navigate(`/hr/karyawan/${item.id}`)} className="rounded-xl font-bold py-2 px-3 focus:bg-primary/5 cursor-pointer">
                                                        <CheckCircle2 className="w-4 h-4 mr-3 text-primary" /> Kelola Checklist
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/hr/karyawan/${item.id}`)} className="rounded-xl font-bold py-2 px-3 focus:bg-primary/5 cursor-pointer">
                                                        <User className="w-4 h-4 mr-3 text-slate-500" /> Lihat Profil
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
