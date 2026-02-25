import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Users,
    Trash2,
    Edit,
    UserPlus,
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
import ModernDeleteDialog from '@/components/master/ModernDeleteDialog';

interface Petugas {
    id: number;
    mess_id: number;
    karyawan_id: number;
    shift: string | null;
    mess: { nama: string };
    karyawan: { nama_lengkap: string; nomor_induk_karyawan: string };
}

interface Mess {
    id: number;
    nama: string;
}

interface Karyawan {
    id: number;
    nama_lengkap: string;
    nomor_induk_karyawan: string;
}

export default function MessPetugasPage() {
    const [petugasList, setPetugasList] = useState<Petugas[]>([]);
    const [messList, setMessList] = useState<Mess[]>([]);
    const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
    const [search, setSearch] = useState('');
    const [karyawanSearch, setKaryawanSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPetugas, setEditingPetugas] = useState<Petugas | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [form, setForm] = useState({
        mess_id: 0,
        karyawan_id: 0,
        shift: 'Pagi'
    });

    const fetchPetugas = useCallback(async () => {
        try {
            const response = await api.get(`/mess/petugas/all?search=${search}`);
            setPetugasList(response.data);
        } catch {
            toast.error('Gagal mengambil data petugas');
        }
    }, [search]);

    const fetchMessList = useCallback(async () => {
        try {
            const response = await api.get('/mess');
            setMessList(response.data);
        } catch {
            toast.error('Gagal mengambil data mess');
        }
    }, []);

    const fetchKaryawanList = useCallback(async () => {
        try {
            const response = await api.get(`/karyawan?search=${karyawanSearch}&limit=10`);
            setKaryawanList(response.data.data || []);
        } catch {
            toast.error('Gagal mengambil data karyawan');
        }
    }, [karyawanSearch]);

    useEffect(() => {
        fetchPetugas();
        fetchMessList();
    }, [fetchPetugas, fetchMessList]);

    useEffect(() => {
        if (showModal) {
            fetchKaryawanList();
        }
    }, [showModal, fetchKaryawanList]);

    const handleSave = async () => {
        if (!form.mess_id || !form.karyawan_id) {
            toast.error('Mess dan Karyawan harus dipilih');
            return;
        }

        try {
            if (editingPetugas) {
                await api.put(`/mess/petugas/${editingPetugas.id}`, form);
                toast.success('Data petugas diperbarui');
            } else {
                await api.post('/mess/petugas', form);
                toast.success('Petugas berhasil ditambahkan');
            }
            setShowModal(false);
            fetchPetugas();
        } catch {
            toast.error('Gagal menyimpan data petugas');
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await api.delete(`/mess/petugas/${deleteId}`);
            toast.success('Petugas berhasil dihapus');
            fetchPetugas();
            setIsDeleteDialogOpen(false);
        } catch {
            toast.error('Gagal menghapus petugas');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                        <Users className="w-6 h-6 text-primary" />
                        Petugas Mess
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Pengelolaan penugasan petugas ke setiap mess.</p>
                </div>
                <Button onClick={() => {
                    setEditingPetugas(null);
                    setForm({ mess_id: 0, karyawan_id: 0, shift: 'Pagi' });
                    setShowModal(true);
                }}>
                    <UserPlus className="w-4 h-4 mr-2" /> Tambah Petugas
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari petugas atau mess..."
                            className="pl-9 bg-white dark:bg-slate-900"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/5 border-b border-slate-100 dark:border-slate-800">
                                    <th className="text-left p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Karyawan</th>
                                    <th className="text-left p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Mess Penugasan</th>
                                    <th className="text-left p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Shift</th>
                                    <th className="text-right p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {petugasList.length > 0 ? petugasList.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold">{p.karyawan.nama_lengkap}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium">{p.karyawan.nomor_induk_karyawan}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="font-black uppercase">{p.mess.nama}</Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className="font-bold">{p.shift}</Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                                    setEditingPetugas(p);
                                                    setForm({ mess_id: p.mess_id, karyawan_id: p.karyawan_id, shift: p.shift || 'Pagi' });
                                                    setShowModal(true);
                                                }}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(p.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground font-bold italic">
                                            Tidak ada data petugas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingPetugas ? 'Edit Penugasan' : 'Tambah Petugas Baru'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Cari Karyawan</label>
                            {editingPetugas ? (
                                <div className="p-2 border rounded-md bg-muted/50 font-bold">
                                    {editingPetugas.karyawan.nama_lengkap}
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Nama atau NIK..."
                                            className="pl-9"
                                            value={karyawanSearch}
                                            onChange={(e) => setKaryawanSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="mt-2 space-y-1 max-h-[150px] overflow-y-auto border rounded-md p-1">
                                        {karyawanList.map(k => (
                                            <div
                                                key={k.id}
                                                className={`p-2 text-xs rounded-md cursor-pointer hover:bg-primary/10 transition-colors ${form.karyawan_id === k.id ? 'bg-primary/20 font-bold' : ''}`}
                                                onClick={() => setForm({ ...form, karyawan_id: k.id })}
                                            >
                                                {k.nama_lengkap} ({k.nomor_induk_karyawan})
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Mess</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                value={form.mess_id}
                                onChange={e => setForm({ ...form, mess_id: Number(e.target.value) })}
                            >
                                <option value={0}>Pilih Mess</option>
                                {messList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Shift</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                value={form.shift}
                                onChange={e => setForm({ ...form, shift: e.target.value })}
                            >
                                <option value="Pagi">Pagi</option>
                                <option value="Siang">Siang</option>
                                <option value="Malam">Malam</option>
                                <option value="Full Day">Full Day</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button onClick={handleSave}>Simpan Penugasan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ModernDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={executeDelete}
                title="Hapus Petugas"
                description="Apakah Anda yakin ingin menghapus petugas ini dari penugasan mess?"
                isLoading={isDeleting}
            />
        </div>
    );
}
