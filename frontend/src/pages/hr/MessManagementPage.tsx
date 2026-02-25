import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Home,
    Trash2,
    Edit,
    MoreVertical,
    UserPlus,
    UserMinus,
    Wrench,
    ClipboardList,
    LayoutDashboard,
    Building2,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import api from '@/lib/api';
import ModernDeleteDialog from '@/components/master/ModernDeleteDialog';

interface Mess {
    id: number;
    code: string;
    nama: string;
    lokasi_kerja_id: number | null;
    blok: string | null;
    lantai: string | null;
    keterangan: string | null;
    status: string;
    lokasi_kerja?: { id: number; nama: string };
    _count?: {
        rooms: number;
    };
}

interface Facility {
    id: number;
    nama: string;
    keterangan: string | null;
}

interface Room {
    id: number;
    mess_id: number;
    nomor_kamar: string;
    kapasitas: number;
    tipe: string | null; // Single, Double, VIP
    status: string;
    facilities: { facility: Facility }[];
    penghuni: {
        id: number;
        nama_lengkap: string;
        nomor_induk_karyawan: string;
    }[];
}

interface DamageReport {
    id: number;
    room_id: number;
    kategori: string | null;
    deskripsi: string;
    status: string;
    tanggal_laporan: string;
    room?: { nomor_kamar: string; mess: { nama: string } };
}

interface CleaningSchedule {
    id: number;
    room_id: number;
    tanggal_jadwal: string;
    status: string;
    catatan: string | null;
    room?: { nomor_kamar: string; mess: { nama: string } };
}

interface Karyawan {
    id: number;
    nama_lengkap: string;
    nomor_induk_karyawan: string;
    foto_karyawan?: string;
}

export default function MessManagementPage() {
    const [messList, setMessList] = useState<Mess[]>([]);
    const [selectedMess, setSelectedMess] = useState<Mess | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [search, setSearch] = useState('');
    const [showMessModal, setShowMessModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingMess, setEditingMess] = useState<Mess | null>(null);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
    const [selectedRoomForAssign, setSelectedRoomForAssign] = useState<Room | null>(null);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [karyawanSearch, setKaryawanSearch] = useState('');
    const [activeMainTab, setActiveMainTab] = useState('master');
    const [lokasiKerja, setLokasiKerja] = useState<{ id: number; nama: string }[]>([]);
    const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
    const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([]);

    // Delete Modal state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'mess' | 'room' | 'unassign'; id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [messForm, setMessForm] = useState({
        code: '',
        nama: '',
        lokasi_kerja_id: 0,
        blok: '',
        lantai: '',
        keterangan: '',
        status: 'Aktif'
    });

    const [roomForm, setRoomForm] = useState({
        nomor_kamar: '',
        kapasitas: 1,
        tipe: 'Single',
        status: 'Tersedia'
    });

    const fetchMess = async () => {
        try {
            const response = await api.get(`/mess?search=${search}`);
            setMessList(response.data);
        } catch {
            toast.error('Gagal mengambil data mess');
        }
    };

    const fetchLokasiKerja = async () => {
        try {
            const response = await api.get('/master/lokasi-kerja');
            setLokasiKerja(response.data);
        } catch {
            toast.error('Gagal mengambil data lokasi kerja');
        }
    };

    const fetchDamageReports = async () => {
        try {
            const response = await api.get('/mess/damage-reports/all');
            setDamageReports(response.data);
        } catch {
            toast.error('Gagal mengambil laporan kerusakan');
        }
    };

    const fetchCleaningSchedules = async () => {
        try {
            const response = await api.get('/mess/cleaning/schedules');
            setCleaningSchedules(response.data);
        } catch {
            toast.error('Gagal mengambil jadwal kebersihan');
        }
    };

    const fetchAllFacilities = async () => {
        try {
            await api.get('/mess/facilities/all');
            // setAllFacilities(response.data); // Reserved for future use
        } catch {
            // silent fail for elective data
        }
    };

    const fetchRooms = async (messId: number) => {
        try {
            const response = await api.get(`/mess/${messId}/rooms`);
            setRooms(response.data);
        } catch {
            toast.error('Gagal mengambil data kamar');
        }
    };

    const fetchKaryawan = async () => {
        try {
            const response = await api.get(`/karyawan?search=${karyawanSearch}&limit=10`);
            setKaryawanList(response.data.data);
        } catch {
            toast.error('Gagal mengambil data karyawan');
        }
    };

    useEffect(() => {
        fetchMess();
        fetchLokasiKerja();
        fetchDamageReports();
        fetchCleaningSchedules();
        fetchAllFacilities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        if (selectedMess) {
            fetchRooms(selectedMess.id);
        }
    }, [selectedMess]);

    useEffect(() => {
        if (showAssignModal) {
            fetchKaryawan();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showAssignModal, karyawanSearch]);

    const handleSaveMess = async () => {
        try {
            const payload = {
                ...messForm,
                lokasi_kerja_id: Number(messForm.lokasi_kerja_id)
            };
            if (editingMess) {
                await api.put(`/mess/${editingMess.id}`, payload);
                toast.success('Mess berhasil diperbarui');
            } else {
                await api.post('/mess', payload);
                toast.success('Mess berhasil dibuat');
            }
            setShowMessModal(false);
            fetchMess();
        } catch {
            toast.error('Gagal menyimpan mess');
        }
    };

    const handleSaveRoom = async () => {
        if (!selectedMess) return;
        try {
            const payload = {
                ...roomForm,
                kapasitas: Number(roomForm.kapasitas)
            };
            if (editingRoom) {
                await api.put(`/mess/rooms/${editingRoom.id}`, payload);
                toast.success('Kamar berhasil diperbarui');
            } else {
                await api.post(`/mess/${selectedMess.id}/rooms`, payload);
                toast.success('Kamar berhasil dibuat');
            }
            setShowRoomModal(false);
            fetchRooms(selectedMess.id);
        } catch {
            toast.error('Gagal menyimpan kamar');
        }
    };

    const handleDeleteMess = (id: number, nama: string) => {
        setDeleteTarget({ type: 'mess', id, name: nama });
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteRoom = (id: number, nomor: string) => {
        setDeleteTarget({ type: 'room', id, name: `Kamar ${nomor}` });
        setIsDeleteDialogOpen(true);
    };

    const handleUnassignClick = (id: number, nama: string) => {
        setDeleteTarget({ type: 'unassign', id, name: nama });
        setIsDeleteDialogOpen(true);
    };

    const handleAssign = async (karyawanId: number) => {
        if (!selectedRoomForAssign) return;
        setAssignmentLoading(true);
        try {
            await api.post('/mess/assign', {
                roomId: selectedRoomForAssign.id,
                karyawanId
            });
            toast.success('Karyawan berhasil ditempatkan');
            setShowAssignModal(false);
            if (selectedMess) fetchRooms(selectedMess.id);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal menempatkan karyawan');
        } finally {
            setAssignmentLoading(false);
        }
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            if (deleteTarget.type === 'mess') {
                await api.delete(`/mess/${deleteTarget.id}`);
                toast.success('Mess berhasil dihapus');
                if (selectedMess?.id === deleteTarget.id) setSelectedMess(null);
                fetchMess();
            } else if (deleteTarget.type === 'room') {
                await api.delete(`/mess/rooms/${deleteTarget.id}`);
                toast.success('Kamar berhasil dihapus');
                if (selectedMess) fetchRooms(selectedMess.id);
            } else if (deleteTarget.type === 'unassign') {
                await api.post('/mess/unassign', { karyawanId: deleteTarget.id });
                toast.success('Karyawan berhasil dikeluarkan');
                if (selectedMess) fetchRooms(selectedMess.id);
            }
            setIsDeleteDialogOpen(false);
        } catch {
            toast.error(`Gagal menghapus ${deleteTarget.type === 'mess' ? 'mess' : deleteTarget.type === 'room' ? 'kamar' : 'penghuni'}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Home className="w-6 h-6 text-primary" />
                        Manajemen Mess & Kamar
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Kelola fasilitas hunian dan penempatan karyawan site.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="master" className="gap-2">
                                <Home className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Master</span>
                            </TabsTrigger>
                            <TabsTrigger value="operasional" className="gap-2">
                                <ClipboardList className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Operasional</span>
                            </TabsTrigger>
                            <TabsTrigger value="perawatan" className="gap-2">
                                <Wrench className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Perawatan</span>
                            </TabsTrigger>
                            <TabsTrigger value="dashboard" className="gap-2">
                                <LayoutDashboard className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Statistik</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button onClick={() => {
                        setEditingMess(null);
                        setMessForm({
                            code: '',
                            nama: '',
                            lokasi_kerja_id: 0,
                            blok: '',
                            lantai: '',
                            keterangan: '',
                            status: 'Aktif'
                        });
                        setShowMessModal(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Mess Baru
                    </Button>
                </div>
            </div>

            <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
                {/* MASTER TAB */}
                <TabsContent value="master" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* MESS LIST SIDEBAR */}
                        <Card className="lg:col-span-1 border-none shadow-md overflow-hidden h-fit">
                            <CardHeader className="bg-muted/10 pb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari mess..."
                                        className="pl-9 bg-white dark:bg-slate-900 border-none shadow-sm h-9 text-xs"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {messList.map((m) => (
                                        <div
                                            key={m.id}
                                            onClick={() => setSelectedMess(m)}
                                            className={`
                                                p-4 cursor-pointer transition-all hover:bg-muted/50
                                                ${selectedMess?.id === m.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-sm font-bold uppercase tracking-tight">{m.nama}</h3>
                                                <Badge variant={m.status === 'Aktif' ? 'success' : 'secondary'} className="text-[9px] px-1.5 py-0">
                                                    {m.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-medium mb-1">
                                                {m.lokasi_kerja?.nama || 'Tanpa Lokasi'} {m.blok ? `- Blok ${m.blok}` : ''}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase">{m.code}</span>
                                                <div className="flex items-center gap-1">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingMess(m);
                                                        setMessForm({
                                                            code: m.code,
                                                            nama: m.nama,
                                                            lokasi_kerja_id: m.lokasi_kerja_id || 0,
                                                            blok: m.blok || '',
                                                            lantai: m.lantai || '',
                                                            keterangan: m.keterangan || '',
                                                            status: m.status
                                                        });
                                                        setShowMessModal(true);
                                                    }}>
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteMess(m.id, m.nama);
                                                    }}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* ROOMS GRID */}
                        <div className="lg:col-span-3">
                            {selectedMess ? (
                                <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                                    <CardHeader className="flex flex-row items-center justify-between bg-primary/5 py-4">
                                        <div>
                                            <CardTitle className="text-lg font-black tracking-tight">{selectedMess.nama}</CardTitle>
                                            <CardDescription className="text-xs font-bold uppercase text-primary/60">
                                                {selectedMess.lokasi_kerja?.nama} {selectedMess.blok ? `• Blok ${selectedMess.blok}` : ''}
                                            </CardDescription>
                                        </div>
                                        <Button size="sm" onClick={() => {
                                            setEditingRoom(null);
                                            setRoomForm({ nomor_kamar: '', kapasitas: 1, tipe: 'Single', status: 'Tersedia' });
                                            setShowRoomModal(true);
                                        }}>
                                            <Plus className="w-4 h-4 mr-2" /> Tambah Kamar
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {rooms.map((room) => (
                                                <Card key={room.id} className={`
                                                    relative overflow-hidden border-none shadow-sm transition-all hover:shadow-md
                                                    ${room.status === 'Penuh' ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'bg-slate-50/50 dark:bg-slate-800/50'}
                                                `}>
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="bg-white dark:bg-slate-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                                                <span className="text-sm font-black text-primary">{room.nomor_kamar}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Badge variant="outline" className="text-[8px] bg-white/50">{room.tipe || 'SGL'}</Badge>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => {
                                                                            setEditingRoom(room);
                                                                            setRoomForm({
                                                                                nomor_kamar: room.nomor_kamar,
                                                                                kapasitas: room.kapasitas,
                                                                                tipe: room.tipe || 'Single',
                                                                                status: room.status
                                                                            });
                                                                            setShowRoomModal(true);
                                                                        }}>
                                                                            <Edit className="w-3 h-3 mr-2" /> Edit Kamar
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-destructive font-bold" onClick={() => handleDeleteRoom(room.id, room.nomor_kamar)}>
                                                                            <Trash2 className="w-3 h-3 mr-2" /> Hapus Kamar
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => {
                                                                            setSelectedRoomForAssign(room);
                                                                            setShowAssignModal(true);
                                                                        }}>
                                                                            <UserPlus className="w-3 h-3 mr-2" /> Tambah Penghuni
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mb-4">
                                                            <Badge variant={room.status === 'Tersedia' ? 'success' : room.status === 'Penuh' ? 'destructive' : 'outline'} className="text-[9px]">
                                                                {room.status}
                                                            </Badge>
                                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                                {room.penghuni.length} / {room.kapasitas} Orang
                                                            </span>
                                                        </div>

                                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${room.penghuni.length === room.kapasitas ? 'bg-rose-500' : 'bg-primary'}`}
                                                                style={{ width: `${(room.penghuni.length / room.kapasitas) * 100}%` }}
                                                            />
                                                        </div>

                                                        <div className="flex flex-wrap gap-1 mb-4">
                                                            {room.facilities?.map((f, i) => (
                                                                <span key={i} className="text-[8px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-muted-foreground font-bold">
                                                                    {f.facility.nama}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        <div className="space-y-2">
                                                            {room.penghuni.map((p) => (
                                                                <div key={p.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                                                            {p.nama_lengkap.charAt(0)}
                                                                        </div>
                                                                        <div className="overflow-hidden">
                                                                            <p className="text-[10px] font-black truncate leading-none mb-0.5">{p.nama_lengkap}</p>
                                                                            <p className="text-[9px] text-muted-foreground font-medium">{p.nomor_induk_karyawan}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => handleUnassignClick(p.id, p.nama_lengkap)}
                                                                    >
                                                                        <UserMinus className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <Home className="w-16 h-16 text-muted-foreground/20 mb-4" />
                                    <h2 className="text-xl font-bold text-muted-foreground">Pilih Mess Terlebih Dahulu</h2>
                                    <p className="text-sm text-muted-foreground/60 font-medium mt-1">Gunakan sidebar untuk memlih atau cari mess.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* OPERASIONAL TAB */}
                <TabsContent value="operasional">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Monitoring Kapasitas & Penempatan</CardTitle>
                            <CardDescription>Visualisasi ketersediaan kamar di seluruh site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {messList.map(m => {
                                    const totalKapasitas = rooms.reduce((acc, r) => r.mess_id === m.id ? acc + r.kapasitas : acc, 0);
                                    const totalPenghuni = rooms.reduce((acc, r) => r.mess_id === m.id ? acc + r.penghuni.length : acc, 0);
                                    const persentase = totalKapasitas > 0 ? (totalPenghuni / totalKapasitas) * 100 : 0;

                                    return (
                                        <Card key={m.id} className="p-4 bg-muted/20 border-none shadow-none">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-tight truncate w-32">{m.nama}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{m.lokasi_kerja?.nama}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Okupansi</span>
                                                <span className="text-xs font-black">{Math.round(persentase)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${persentase > 90 ? 'bg-rose-500' : persentase > 70 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                    style={{ width: `${persentase}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
                                                <span>{totalPenghuni} Penghuni</span>
                                                <span>{totalKapasitas} Kapasitas</span>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PERAWATAN TAB */}
                <TabsContent value="perawatan">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Laporan Kerusakan</CardTitle>
                                    <CardDescription>Daftar keluhan dan kerusakan kamar.</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" onClick={fetchDamageReports}>
                                    <Plus className="w-3.5 h-3.5 mr-2" /> Buat Laporan
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {damageReports.map(report => (
                                        <div key={report.id} className="flex items-start gap-4 p-3 rounded-xl bg-muted/30">
                                            <div className={`p-2 rounded-lg ${report.status === 'Selesai' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                                <AlertCircle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="text-xs font-black uppercase">{report.kategori} - {report.room?.nomor_kamar}</h5>
                                                    <Badge variant={report.status === 'Selesai' ? 'success' : 'destructive'} className="text-[8px]">{report.status}</Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{report.deskripsi}</p>
                                                <p className="text-[9px] text-muted-foreground font-medium mt-1">{report.room?.mess.nama} • {new Date(report.tanggal_laporan).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {damageReports.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-xs text-muted-foreground font-medium">Tidak ada laporan kerusakan aktif.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Jadwal Kebersihan</CardTitle>
                                    <CardDescription>Agenda cleaning harian mess.</CardDescription>
                                </div>
                                <Button size="sm" variant="outline">
                                    <Calendar className="w-3.5 h-3.5 mr-2" /> Atur Jadwal
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {cleaningSchedules.map(schedule => (
                                        <div key={schedule.id} className="flex items-start gap-4 p-3 rounded-xl bg-muted/30 border-l-4 border-primary">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="text-xs font-black uppercase">KM {schedule.room?.nomor_kamar} - {schedule.room?.mess.nama}</h5>
                                                    <Badge variant="outline" className="text-[8px]">{schedule.status}</Badge>
                                                </div>
                                                <p className="text-xs font-bold mt-1 text-primary">{new Date(schedule.tanggal_jadwal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{schedule.catatan || 'Pembersihan rutin'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {cleaningSchedules.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-xs text-muted-foreground font-medium">Tidak ada jadwal kebersihan yang diatur.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* DASHBOARD TAB */}
                <TabsContent value="dashboard">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-md bg-primary text-primary-foreground">
                            <CardContent className="pt-6">
                                <p className="text-xs font-bold uppercase opacity-70">Total Hunian</p>
                                <h3 className="text-4xl font-black mt-2">
                                    {rooms.reduce((acc, r) => acc + r.penghuni.length, 0)}
                                </h3>
                                <p className="text-[10px] mt-2 font-medium opacity-80">Dari total {rooms.reduce((acc, r) => acc + r.kapasitas, 0)} kapasitas tersedia.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-amber-500 text-white">
                            <CardContent className="pt-6">
                                <p className="text-xs font-bold uppercase opacity-70">Kamar Butuh Perhatian</p>
                                <h3 className="text-4xl font-black mt-2">
                                    {damageReports.filter(r => r.status !== 'Selesai').length}
                                </h3>
                                <p className="text-[10px] mt-2 font-medium opacity-80">Laporan kerusakan yang sedang diproses.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-slate-900 text-white">
                            <CardContent className="pt-6">
                                <p className="text-xs font-bold uppercase opacity-70">Rerata Okupansi</p>
                                <h3 className="text-4xl font-black mt-2">
                                    {Math.round((rooms.reduce((acc, r) => acc + r.penghuni.length, 0) / (rooms.reduce((acc, r) => acc + r.kapasitas, 0) || 1)) * 100)}%
                                </h3>
                                <p className="text-[10px] mt-2 font-medium opacity-80">Persentase hunian di seluruh area.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* MODAL MESS */}
            <Dialog open={showMessModal} onOpenChange={setShowMessModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingMess ? 'Edit Mess' : 'Mess Baru'}</DialogTitle>
                        <DialogDescription>Masukkan informasi detail fasilitas mess.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kode Mess</label>
                                <Input placeholder="Contoh: MS-TAL-01" value={messForm.code} onChange={e => setMessForm({ ...messForm, code: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Mess</label>
                                <Input placeholder="Nama gedung" value={messForm.nama} onChange={e => setMessForm({ ...messForm, nama: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Site / Lokasi</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={messForm.lokasi_kerja_id}
                                    onChange={e => setMessForm({ ...messForm, lokasi_kerja_id: Number(e.target.value) })}
                                >
                                    <option value={0}>Pilih Site</option>
                                    {lokasiKerja.map(l => (
                                        <option key={l.id} value={l.id}>{l.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Blok / Area</label>
                                <Input placeholder="Contoh: Blok A" value={messForm.blok} onChange={e => setMessForm({ ...messForm, blok: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Keterangan</label>
                            <Input placeholder="Catatan tambahan" value={messForm.keterangan || ''} onChange={e => setMessForm({ ...messForm, keterangan: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMessModal(false)}>Batal</Button>
                        <Button onClick={handleSaveMess}>Simpan Mess</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL ROOM */}
            <Dialog open={showRoomModal} onOpenChange={setShowRoomModal}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? 'Edit Kamar' : 'Tambah Kamar'}</DialogTitle>
                        <DialogDescription>Konfigurasi kapasitas dan nomor unit kamar.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nomor Kamar</label>
                                <Input placeholder="001" value={roomForm.nomor_kamar} onChange={e => setRoomForm({ ...roomForm, nomor_kamar: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pax</label>
                                <Input type="number" value={roomForm.kapasitas} onChange={e => setRoomForm({ ...roomForm, kapasitas: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tipe Kamar</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={roomForm.tipe || 'Single'}
                                    onChange={e => setRoomForm({ ...roomForm, tipe: e.target.value })}
                                >
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                    <option value="VIP">VIP</option>
                                    <option value="Sharing">Sharing</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={roomForm.status}
                                    onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}
                                >
                                    <option value="Tersedia">Tersedia</option>
                                    <option value="Penuh">Penuh</option>
                                    <option value="Rusak">Rusak</option>
                                    <option value="Dibersihkan">Dibersihkan</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoomModal(false)}>Batal</Button>
                        <Button onClick={handleSaveRoom}>Simpan Kamar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL ASSIGN */}
            <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Penghuni Kamar {selectedRoomForAssign?.nomor_kamar}</DialogTitle>
                        <DialogDescription>Pilih karyawan untuk ditempatkan di kamar ini.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari NIK atau Nama Karyawan..."
                                className="pl-9"
                                value={karyawanSearch}
                                onChange={(e) => setKaryawanSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                            {karyawanList.map((k) => (
                                <div key={k.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {k.nama_lengkap.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{k.nama_lengkap}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{k.nomor_induk_karyawan}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => handleAssign(k.id)} disabled={assignmentLoading}>
                                        {assignmentLoading ? '...' : <Plus className="w-4 h-4" />}
                                    </Button>
                                </div>
                            ))}
                            {karyawanList.length === 0 && (
                                <p className="text-center text-xs text-muted-foreground py-8">Karyawan tidak ditemukan</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ModernDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={executeDelete}
                isLoading={isDeleting}
                title={
                    deleteTarget?.type === 'mess' ? 'Hapus Mess' :
                        deleteTarget?.type === 'room' ? 'Hapus Kamar' : 'Keluarkan Penghuni'
                }
                description={
                    deleteTarget?.type === 'mess' ? `Apakah Anda yakin ingin menghapus mess "${deleteTarget?.name}" beserta seluruh data kamarnya?` :
                        deleteTarget?.type === 'room' ? `Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"?` :
                            `Apakah Anda yakin ingin mengeluarkan "${deleteTarget?.name}" dari kamar?`
                }
                itemName={deleteTarget?.name || ''}
            />
        </div>
    );
}
