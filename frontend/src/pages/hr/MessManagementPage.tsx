import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Home,
    Trash2,
    Edit,
    MoreVertical,
    Info,
    UserPlus,
    UserMinus
} from 'lucide-react';
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
    lokasi: string;
    keterangan: string;
    status: string;
    _count?: {
        rooms: number;
    };
}

interface Room {
    id: number;
    mess_id: number;
    nomor_kamar: string;
    kapasitas: number;
    fasilitas: string;
    status: string;
    penghuni: {
        id: number;
        nama_lengkap: string;
        nomor_induk_karyawan: string;
    }[];
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
    const [loading, setLoading] = useState(true);
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

    // Delete Modal state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'mess' | 'room' | 'unassign'; id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [messForm, setMessForm] = useState({
        code: '',
        nama: '',
        lokasi: '',
        keterangan: '',
        status: 'Aktif'
    });

    const [roomForm, setRoomForm] = useState({
        nomor_kamar: '',
        kapasitas: 1,
        fasilitas: '',
        status: 'Tersedia'
    });

    const fetchMess = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/mess?search=${search}`);
            setMessList(response.data);
            if (response.data.length > 0 && !selectedMess) {
                // Jangan auto-select jika search berubah tapi mess sudah dipilih
                // setSelectedMess(response.data[0]); 
            }
        } catch {
            toast.error('Gagal mengambil data mess');
        } finally {
            setLoading(false);
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
            if (editingMess) {
                await api.put(`/mess/${editingMess.id}`, messForm);
                toast.success('Mess berhasil diperbarui');
            } else {
                await api.post('/mess', messForm);
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
            if (editingRoom) {
                await api.put(`/mess/rooms/${editingRoom.id}`, roomForm);
                toast.success('Kamar berhasil diperbarui');
            } else {
                await api.post(`/mess/${selectedMess.id}/rooms`, roomForm);
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
                    <Button onClick={() => {
                        setEditingMess(null);
                        setMessForm({ code: '', nama: '', lokasi: '', keterangan: '', status: 'Aktif' });
                        setShowMessModal(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Mess Baru
                    </Button>
                </div>
            </div>

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
                                    <p className="text-[11px] text-muted-foreground font-medium mb-1">{m.lokasi}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase">{m.code}</span>
                                        <div className="flex items-center gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingMess(m);
                                                setMessForm({ code: m.code, nama: m.nama, lokasi: m.lokasi, keterangan: m.keterangan, status: m.status });
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
                            {messList.length === 0 && !loading && (
                                <div className="p-8 text-center">
                                    <Info className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground font-bold">Tidak ada mess ditemukan</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ROOMS GRID */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedMess ? (
                        <>
                            <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                                <CardHeader className="flex flex-row items-center justify-between bg-primary/5 py-4">
                                    <div>
                                        <CardTitle className="text-lg font-black tracking-tight">{selectedMess.nama}</CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase text-primary/60">{selectedMess.lokasi}</CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => {
                                        setEditingRoom(null);
                                        setRoomForm({ nomor_kamar: '', kapasitas: 1, fasilitas: '', status: 'Tersedia' });
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
                                                                        fasilitas: room.fasilitas,
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
                                        {rooms.length === 0 && (
                                            <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                <Home className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                                <p className="text-sm font-bold text-muted-foreground">Belum ada kamar terdaftar di mess ini</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Home className="w-16 h-16 text-muted-foreground/20 mb-4" />
                            <h2 className="text-xl font-bold text-muted-foreground">Pilih Mess Terlebih Dahulu</h2>
                            <p className="text-sm text-muted-foreground/60 font-medium mt-1">Gunakan sidebar untuk memlih atau cari mess.</p>
                        </div>
                    )}
                </div>
            </div>

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
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Lokasi</label>
                            <Input placeholder="Detail lokasi atau blok" value={messForm.lokasi} onChange={e => setMessForm({ ...messForm, lokasi: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Keterangan</label>
                            <Input placeholder="Catatan tambahan" value={messForm.keterangan} onChange={e => setMessForm({ ...messForm, keterangan: e.target.value })} />
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
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kapasitas (Pax)</label>
                                <Input type="number" value={roomForm.kapasitas} onChange={e => setRoomForm({ ...roomForm, kapasitas: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status Kamar</label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={roomForm.status}
                                onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}
                            >
                                <option value="Tersedia">Tersedia</option>
                                <option value="Renovasi">Renovasi</option>
                                <option value="Penuh">Penuh</option>
                            </select>
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
