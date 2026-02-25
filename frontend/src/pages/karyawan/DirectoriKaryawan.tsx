import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    FileDown,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Printer,
    Users,
    MapPin,
    Briefcase,
    Loader2,
    X,
    Trash2,
    UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ModalCetakIDCard } from '@/components/ModalCetakIDCard';
import { ModalImportKaryawan } from '@/components/ModalImportKaryawan';
import type { KaryawanListItem } from '@/types/karyawan';
import api from '@/lib/api';
import { toast } from 'sonner';
import ModernDeleteDialog from '@/components/master/ModernDeleteDialog';

interface MasterItem {
    id: number;
    nama: string;
}

export const DirectoriKaryawan = () => {
    const navigate = useNavigate();
    // Data States
    const [data, setData] = useState<KaryawanListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Pagination & Filter States
    const [page, setPage] = useState(1);
    const [pageSize] = useState(15);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [divisiFilter, setDivisiFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [lokasiFilter, setLokasiFilter] = useState('all');

    // Master Data for Selects
    const [master, setMaster] = useState<{
        divisi: MasterItem[];
        department: MasterItem[];
        statusKaryawan: MasterItem[];
        lokasiKerja: MasterItem[];
    }>({
        divisi: [],
        department: [],
        statusKaryawan: [],
        lokasiKerja: []
    });

    // Selection States
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showCetakModal, setShowCetakModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Delete Modal state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single');
    const [itemToDelete, setItemToDelete] = useState<{ id: number; nama: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial Fetch (Master Data)
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const [div, dpt, stat, loc] = await Promise.all([
                    api.get('/master/divisi/aktif'),
                    api.get('/master/department/aktif'),
                    api.get('/master/status-karyawan/aktif'),
                    api.get('/master/lokasi-kerja/aktif')
                ]);
                setMaster({
                    divisi: div.data,
                    department: dpt.data,
                    statusKaryawan: stat.data,
                    lokasiKerja: loc.data
                });
            } catch (error) {
                console.error('Failed to fetch master data', error);
            }
        };
        fetchMaster();
    }, []);

    // Fetch Karyawan Data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string | number | undefined> = {
                page,
                limit: pageSize,
                search: search || undefined,
                divisi_id: divisiFilter !== 'all' ? divisiFilter : undefined,
                department_id: deptFilter !== 'all' ? deptFilter : undefined,
                status_karyawan_id: statusFilter !== 'all' ? statusFilter : undefined,
                lokasi_kerja_id: lokasiFilter !== 'all' ? lokasiFilter : undefined,
            };

            const response = await api.get('/karyawan', { params });
            setData(response.data.data);
            setSelectedIds(new Set()); // Reset selection when data changes
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch karyawan', error);
            toast.error('Gagal mengambil data karyawan');
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, search, divisiFilter, deptFilter, statusFilter, lokasiFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    // Handlers
    const handleSelectAll = (checked: boolean | string) => {
        if (checked === true) {
            setSelectedIds(new Set(data.map(k => k.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelection = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleInitializeOffboarding = async (id: number) => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/karyawan/offboarding/init/${id}`);
            toast.success(res.data.message);
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Gagal inisialisasi offboarding');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = {
                search: search || undefined,
                divisi_id: divisiFilter !== 'all' ? divisiFilter : undefined,
                department_id: deptFilter !== 'all' ? deptFilter : undefined,
                status_karyawan_id: statusFilter !== 'all' ? statusFilter : undefined,
                lokasi_kerja_id: lokasiFilter !== 'all' ? lokasiFilter : undefined,
            };

            const response = await api.get('/karyawan/export', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data-karyawan.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Data karyawan berhasil diekspor');
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Gagal mengekspor data');
        } finally {
            setIsExporting(false);
        }
    };

    const getSelectedKaryawan = () => {
        return data.filter(k => selectedIds.has(k.id));
    };

    const handleDelete = (id: number, nama: string) => {
        setItemToDelete({ id, nama });
        setDeleteType('single');
        setIsDeleteDialogOpen(true);
    };

    const handleBulkDelete = () => {
        setDeleteType('bulk');
        setIsDeleteDialogOpen(true);
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteType === 'single' && itemToDelete) {
                await api.delete(`/karyawan/${itemToDelete.id}`);
                toast.success(`Karyawan ${itemToDelete.nama} berhasil dihapus`);
            } else if (deleteType === 'bulk') {
                const count = selectedIds.size;
                for (const id of Array.from(selectedIds)) {
                    await api.delete(`/karyawan/${id}`);
                }
                toast.success(`${count} karyawan berhasil dihapus`);
            }
            setSelectedIds(new Set());
            setIsDeleteDialogOpen(false);
            fetchData();
        } catch (error: unknown) {
            console.error('Delete failed', error);
            let message = 'Gagal menghapus karyawan';
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                message = error.response.data.message;
            }
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">DIREKTORI KARYAWAN</h1>
                        <p className="text-slate-500 font-medium">Manajemen data profil dan identitas karyawan aktif.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="h-12 rounded-xl px-6 font-black uppercase tracking-widest border-slate-200"
                    >
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileDown className="w-5 h-5 mr-2" />}
                        Ekspor Excel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowImportModal(true)}
                        className="h-12 rounded-xl px-6 font-black uppercase tracking-widest border-slate-200"
                    >
                        Impor Data
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/karyawan/tambah')}
                        className="h-12 rounded-xl px-6 font-black uppercase tracking-widest bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Tambah Karyawan
                    </Button>
                </div>
            </div>

            {/* Filter Area */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <Checkbox
                            id="select-all"
                            checked={data.length > 0 && selectedIds.size === data.length}
                            onCheckedChange={handleSelectAll}
                            className="w-5 h-5 rounded border-slate-300"
                        />
                        <Label htmlFor="select-all" className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">
                            Pilih Semua
                        </Label>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative group lg:col-span-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Cari NIK atau Nama..."
                            className="pl-12 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-medium"
                        />
                    </div>

                    <Select value={divisiFilter} onValueChange={(v: string) => { setDivisiFilter(v); setPage(1); }}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                            <SelectValue placeholder="Semua Divisi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold">Semua Divisi</SelectItem>
                            {master.divisi.map((it) => (
                                <SelectItem key={it.id} value={it.id.toString()} className="font-bold">{it.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={deptFilter} onValueChange={(v: string) => { setDeptFilter(v); setPage(1); }}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                            <SelectValue placeholder="Semua Departemen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold">Semua Departemen</SelectItem>
                            {master.department.map((it) => (
                                <SelectItem key={it.id} value={it.id.toString()} className="font-bold">{it.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold">Semua Status</SelectItem>
                            {master.statusKaryawan.map((it) => (
                                <SelectItem key={it.id} value={it.id.toString()} className="font-bold">{it.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={lokasiFilter} onValueChange={(v: string) => { setLokasiFilter(v); setPage(1); }}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                            <SelectValue placeholder="Semua Lokasi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold">Semua Lokasi</SelectItem>
                            {master.lokasiKerja.map((it) => (
                                <SelectItem key={it.id} value={it.id.toString()} className="font-bold">{it.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-black text-sm">{selectedIds.size}</span>
                            </div>
                            <p className="text-sm font-black text-primary uppercase tracking-widest italic">Karyawan Terpilih</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setShowCetakModal(true)}
                                className="h-10 rounded-xl px-4 font-black uppercase tracking-widest bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak ID
                            </Button>
                            <Button
                                onClick={handleBulkDelete}
                                variant="destructive"
                                className="h-10 rounded-xl px-4 font-black uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/25 transition-all"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Terpilih
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedIds(new Set())}
                                className="h-10 w-10 text-slate-400 hover:text-red-500 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
                            <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4 mx-auto" />
                                <Skeleton className="h-3 w-1/2 mx-auto" />
                            </div>
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    ))
                ) : data.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <Users className="w-16 h-16 opacity-20" />
                        <p className="text-lg font-black uppercase tracking-widest italic">Data tidak ditemukan</p>
                    </div>
                ) : (
                    data.map((it) => (
                        <div
                            key={it.id}
                            onClick={() => navigate(`/hr/karyawan/${it.id}`)}
                            className={`group relative bg-white p-6 rounded-3xl shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${selectedIds.has(it.id) ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-slate-100'
                                }`}
                        >
                            {/* Selection Checkbox */}
                            <div
                                className={`absolute top-4 left-4 z-10 transition-opacity duration-200 ${selectedIds.has(it.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Checkbox
                                    checked={selectedIds.has(it.id)}
                                    onCheckedChange={() => toggleSelection(it.id)}
                                    className="w-6 h-6 rounded-lg border-2 border-slate-300 bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                            </div>

                            {/* Options Button Placeholder */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-50">
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </Button>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <Avatar className="w-24 h-24 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                                    <AvatarImage src={it.foto_karyawan || ''} className="object-cover" />
                                    <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary uppercase">
                                        {it.nama_lengkap.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <h3 className="font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                        {it.nama_lengkap}
                                    </h3>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                                        NIK: {it.nomor_induk_karyawan}
                                    </p>
                                </div>

                                <div className="w-full h-px bg-slate-50" />

                                <div className="w-full space-y-2 text-left">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-3 h-3 text-slate-400" />
                                        <p className="text-[10px] font-bold text-slate-600 line-clamp-1">{it.posisi_jabatan.nama}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        <p className="text-[10px] font-bold text-slate-500 line-clamp-1">{it.divisi.nama}</p>
                                    </div>
                                </div>

                                <div className="w-full flex flex-wrap gap-1 mt-auto">
                                    <Badge
                                        variant="outline"
                                        style={{ borderColor: it.status_karyawan.warna, color: it.status_karyawan.warna, backgroundColor: `${it.status_karyawan.warna}10` }}
                                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0 border-2"
                                    >
                                        {it.status_karyawan.nama}
                                    </Badge>
                                    {it.tags.slice(0, 1).map((t: { tag: { nama: string; warna: string } }, idx: number) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0 bg-slate-100 text-slate-500"
                                        >
                                            {t.tag.nama}
                                        </Badge>
                                    ))}
                                    {it.tags.length > 1 && (
                                        <Badge variant="secondary" className="text-[9px] font-black px-2 py-0 bg-slate-100 text-slate-500">
                                            +{it.tags.length - 1}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Quick Action Overlay (Bottom) */}
                            <div className="mt-6 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between">
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline"
                                    onClick={() => navigate(`/hr/karyawan/${it.id}`)}
                                >
                                    Lihat Profil
                                </Button>
                                {it.status_karyawan.nama === 'Aktif' && (!it.status_proses || it.status_proses === 'Aktif') && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border-none"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleInitializeOffboarding(it.id);
                                        }}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <UserMinus className="w-3 h-3 mr-1" />}
                                        Offboarding
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest bg-slate-100 hover:bg-primary hover:text-white transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedIds(new Set([it.id]));
                                        setShowCetakModal(true);
                                    }}
                                >
                                    <Printer className="w-3 h-3 mr-1" />
                                    Cetak ID
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-xl px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(it.id, it.nama_lengkap);
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Area */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-500 order-2 sm:order-1">
                    Menampilkan <span className="font-black text-slate-900">{Math.min(pageSize * (page - 1) + 1, total)}</span> - <span className="font-black text-slate-900">{Math.min(pageSize * page, total)}</span> dari <span className="font-black text-slate-900">{total}</span> karyawan
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="w-11 h-11 rounded-xl border-slate-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            const p = i + 1; // Simplistic pagination for now
                            return (
                                <Button
                                    key={p}
                                    variant={page === p ? 'default' : 'ghost'}
                                    onClick={() => setPage(p)}
                                    className={`w-11 h-11 rounded-xl font-black ${page === p ? 'shadow-lg shadow-primary/25' : 'text-slate-400 hover:text-primary'}`}
                                >
                                    {p}
                                </Button>
                            );
                        })}
                        {totalPages > 5 && <span className="px-2 text-slate-400">...</span>}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(page + 1)}
                        className="w-11 h-11 rounded-xl border-slate-200"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Modal Import */}
            <ModalImportKaryawan
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={fetchData}
            />

            {/* Modal Cetak */}
            <ModalCetakIDCard
                open={showCetakModal}
                onClose={() => setShowCetakModal(false)}
                karyawanList={getSelectedKaryawan()}
            />

            <ModernDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={executeDelete}
                title={deleteType === 'single' ? "Hapus Karyawan" : "Hapus Massal Karyawan"}
                description={
                    deleteType === 'single'
                        ? `Apakah Anda yakin ingin menghapus data karyawan "${itemToDelete?.nama}" secara permanen? Seluruh dokumen dan foto terkait juga akan dihapus.`
                        : `Apakah Anda yakin ingin menghapus ${selectedIds.size} karyawan terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.`
                }
                isLoading={isDeleting}
            />
        </div>
    );
};
