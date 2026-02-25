import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Plus,
    Search,
    Home,
    Trash2,
    Edit,
    MoreVertical,
    UserPlus,
    UserMinus,
    MoveRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
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
}

interface Room {
    id: number;
    mess_id: number;
    nomor_kamar: string;
    kapasitas: number;
    tipe: string | null;
    status: string;
    facilities: { facility: { id: number; nama: string } }[];
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
    mess_room?: {
        nomor_kamar: string;
        mess: {
            nama: string;
        };
    } | null;
}

export default function MessMasterPage() {
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
    const [karyawanSearch, setKaryawanSearch] = useState('');
    const [lokasiKerja, setLokasiKerja] = useState<{ id: number; nama: string }[]>([]);
    const [availableFacilities, setAvailableFacilities] = useState<{ id: number; nama: string }[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();

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
        status: 'Tersedia',
        facility_ids: [] as number[]
    });

    const fetchMess = useCallback(async () => {
        try {
            const response = await api.get(`/mess?search=${search}`);
            setMessList(response.data);
        } catch {
            toast.error('Gagal mengambil data mess');
        }
    }, [search]);

    const fetchLokasiKerja = useCallback(async () => {
        try {
            const response = await api.get('/master/lokasi-kerja');
            setLokasiKerja(response.data.data || []);
        } catch {
            toast.error('Gagal mengambil data lokasi kerja');
        }
    }, []);

    const fetchAvailableFacilities = useCallback(async () => {
        try {
            const response = await api.get('/mess/facilities/all');
            setAvailableFacilities(response.data);
        } catch {
            toast.error('Gagal mengambil data fasilitas');
        }
    }, []);

    const fetchRooms = useCallback(async (messId: number) => {
        try {
            const response = await api.get(`/mess/${messId}/rooms`);
            setRooms(response.data);
        } catch {
            toast.error('Gagal mengambil data kamar');
        }
    }, []);

    const fetchKaryawan = useCallback(async () => {
        try {
            const response = await api.get(`/karyawan?search=${karyawanSearch}&limit=10`);
            setKaryawanList(response.data.data);
        } catch {
            toast.error('Gagal mengambil data karyawan');
        }
    }, [karyawanSearch]);

    useEffect(() => {
        fetchMess();
        fetchLokasiKerja();
        fetchAvailableFacilities();
    }, [fetchMess, fetchLokasiKerja, fetchAvailableFacilities]);

    useEffect(() => {
        const messId = searchParams.get('id');
        const action = searchParams.get('action');

        if (messList.length > 0) {
            if (messId) {
                const mess = messList.find(m => m.id === Number(messId));
                if (mess) {
                    setSelectedMess(mess);
                    // Clear search params to avoid re-triggering on refresh if user changes mess
                    setSearchParams({}, { replace: true });
                }
            }
            if (action === 'add') {
                setShowMessModal(true);
                setSearchParams({}, { replace: true });
            }
        }
    }, [messList, searchParams, setSearchParams]);

    useEffect(() => {
        if (selectedMess) {
            fetchRooms(selectedMess.id);
        }
    }, [selectedMess, fetchRooms]);

    useEffect(() => {
        if (showAssignModal) {
            fetchKaryawan();
        }
    }, [showAssignModal, fetchKaryawan]);

    const handleSaveMess = async () => {
        try {
            const payload = { ...messForm, lokasi_kerja_id: Number(messForm.lokasi_kerja_id) };
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
            const payload = { ...roomForm, kapasitas: Number(roomForm.kapasitas) };
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
        try {
            await api.post('/mess/assign', { roomId: selectedRoomForAssign.id, karyawanId });
            toast.success('Karyawan berhasil ditempatkan');
            setShowAssignModal(false);
            if (selectedMess) fetchRooms(selectedMess.id);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal menempatkan karyawan';
            toast.error(message);
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
            toast.error('Operasi gagal');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                        <Home className="w-6 h-6 text-primary" />
                        Gedung & Kamar
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Pengaturan properti dan alokasi kapasitas.</p>
                </div>
                <Button onClick={() => {
                    setEditingMess(null);
                    setMessForm({ code: '', nama: '', lokasi_kerja_id: 0, blok: '', lantai: '', keterangan: '', status: 'Aktif' });
                    setShowMessModal(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" /> Mess Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                    <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {messList.map((m) => (
                                <div
                                    key={m.id}
                                    onClick={() => setSelectedMess(m)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${selectedMess?.id === m.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold uppercase tracking-tight">{m.nama}</h3>
                                        <Badge variant={m.status === 'Aktif' ? 'success' : 'secondary'} className="text-[9px] px-1.5 py-0">{m.status}</Badge>
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
                                                setMessForm({ code: m.code, nama: m.nama, lokasi_kerja_id: m.lokasi_kerja_id || 0, blok: m.blok || '', lantai: m.lantai || '', keterangan: m.keterangan || '', status: m.status });
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
                                    setRoomForm({ nomor_kamar: '', kapasitas: 1, tipe: 'Single', status: 'Tersedia', facility_ids: [] });
                                    setShowRoomModal(true);
                                }}>
                                    <Plus className="w-4 h-4 mr-2" /> Tambah Kamar
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {rooms.map((room) => (
                                        <Card key={room.id} className={`p-4 relative overflow-hidden border-none shadow-sm transition-all hover:shadow-md ${room.status === 'Penuh' ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
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
                                                                tipe: room.tipe || 'Single',
                                                                status: room.status,
                                                                facility_ids: room.facilities?.map(f => f.facility.id) || []
                                                            });
                                                            setShowRoomModal(true);
                                                        }}>
                                                            <Edit className="w-3 h-3 mr-2" /> Edit Kamar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive font-bold" onClick={() => handleDeleteRoom(room.id, room.nomor_kamar)}>
                                                            <Trash2 className="w-3 h-3 mr-2" /> Hapus Kamar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setSelectedRoomForAssign(room); setShowAssignModal(true); }}>
                                                            <UserPlus className="w-3 h-3 mr-2" /> Tambah Penghuni
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant={room.status === 'Tersedia' ? 'success' : room.status === 'Penuh' ? 'destructive' : 'outline'} className="text-[9px]">{room.status}</Badge>
                                                <span className="text-[10px] font-bold text-muted-foreground">{room.penghuni.length} / {room.kapasitas}</span>
                                            </div>
                                            {room.facilities && room.facilities.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {room.facilities.map(f => (
                                                        <Badge key={f.facility.id} variant="secondary" className="text-[7px] px-1 py-0 uppercase bg-muted/40 font-bold whitespace-nowrap">
                                                            {f.facility.nama}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                                                <div className={`h-full transition-all duration-500 ${room.penghuni.length === room.kapasitas ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${(room.penghuni.length / room.kapasitas) * 100}%` }} />
                                            </div>
                                            <div className="space-y-2">
                                                {room.penghuni.map((p) => (
                                                    <div key={p.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{p.nama_lengkap.charAt(0)}</div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-[10px] font-black truncate leading-none mb-0.5">{p.nama_lengkap}</p>
                                                                <p className="text-[9px] text-muted-foreground font-medium">{p.nomor_induk_karyawan}</p>
                                                            </div>
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => handleUnassignClick(p.id, p.nama_lengkap)}><UserMinus className="w-3 h-3" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 font-bold text-muted-foreground">
                            <Home className="w-16 h-16 opacity-20 mb-4" />
                            Pilih mess di sidebar untuk melihat kamar.
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <Dialog open={showMessModal} onOpenChange={setShowMessModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingMess ? 'Edit Mess' : 'Tambah Mess Baru'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-xs font-bold uppercase">Kode</label><Input value={messForm.code} onChange={e => setMessForm({ ...messForm, code: e.target.value })} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold uppercase">Nama Mess</label><Input value={messForm.nama} onChange={e => setMessForm({ ...messForm, nama: e.target.value })} /></div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Lokasi Kerja</label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={messForm.lokasi_kerja_id} onChange={e => setMessForm({ ...messForm, lokasi_kerja_id: Number(e.target.value) })}>
                                <option value={0}>Pilih Lokasi</option>
                                {lokasiKerja.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-xs font-bold uppercase">Blok</label><Input value={messForm.blok} onChange={e => setMessForm({ ...messForm, blok: e.target.value })} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold uppercase">Lantai</label><Input value={messForm.lantai} onChange={e => setMessForm({ ...messForm, lantai: e.target.value })} /></div>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveMess}>Simpan Mess</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRoomModal} onOpenChange={setShowRoomModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingRoom ? 'Edit Kamar' : 'Tambah Kamar'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-xs font-bold uppercase">Nomor Kamar</label><Input value={roomForm.nomor_kamar} onChange={e => setRoomForm({ ...roomForm, nomor_kamar: e.target.value })} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold uppercase">Kapasitas (Orang)</label><Input type="number" value={roomForm.kapasitas} onChange={e => setRoomForm({ ...roomForm, kapasitas: Number(e.target.value) })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase">Tipe</label>
                                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={roomForm.tipe} onChange={e => setRoomForm({ ...roomForm, tipe: e.target.value })}>
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase">Status</label>
                                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={roomForm.status} onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}>
                                    <option value="Tersedia">Tersedia</option>
                                    <option value="Penuh">Penuh</option>
                                    <option value="Rusak">Rusak</option>
                                    <option value="Dibersihkan">Dibersihkan</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase">Fasilitas Kamar</label>
                            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-2 border rounded-md bg-muted/5 shadow-inner">
                                {availableFacilities.map(f => (
                                    <div key={f.id} className="flex items-center gap-2 hover:bg-muted/30 p-1 rounded-md transition-colors">
                                        <input
                                            type="checkbox"
                                            id={`facility-modal-${f.id}`}
                                            checked={roomForm.facility_ids.includes(f.id)}
                                            onChange={(e) => {
                                                const ids = e.target.checked
                                                    ? [...roomForm.facility_ids, f.id]
                                                    : roomForm.facility_ids.filter(id => id !== f.id);
                                                setRoomForm({ ...roomForm, facility_ids: ids });
                                            }}
                                            className="w-3.5 h-3.5 rounded border-muted-foreground/30 text-primary focus:ring-primary/30"
                                        />
                                        <label htmlFor={`facility-modal-${f.id}`} className="text-[11px] font-bold uppercase cursor-pointer select-none">
                                            {f.nama}
                                        </label>
                                    </div>
                                ))}
                                {availableFacilities.length === 0 && (
                                    <p className="text-[10px] text-muted-foreground italic col-span-2 p-2 text-center">Tidak ada fasilitas master tersedia.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveRoom}>Simpan Kamar</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Pilih Karyawan</DialogTitle></DialogHeader>
                    <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari karyawan..." className="pl-9" value={karyawanSearch} onChange={e => setKaryawanSearch(e.target.value)} /></div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {karyawanList.map(k => (
                            <div key={k.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-muted/50 cursor-pointer" onClick={() => handleAssign(k.id)}>
                                <div>
                                    <p className="text-sm font-bold">{k.nama_lengkap}</p>
                                    <p className="text-xs text-muted-foreground">{k.nomor_induk_karyawan}</p>
                                    {k.mess_room && (
                                        <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">
                                            Saat ini: {k.mess_room.mess.nama} ({k.mess_room.nomor_kamar})
                                        </p>
                                    )}
                                </div>
                                {k.mess_room ? <MoveRight className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-primary" />}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <ModernDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={executeDelete}
                title={`Hapus ${deleteTarget?.type === 'mess' ? 'Mess' : 'Kamar'}`}
                description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={isDeleting}
            />
        </div>
    );
}
