import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Gem,
    Trash2,
    Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import api from '@/lib/api';
import ModernDeleteDialog from '@/components/master/ModernDeleteDialog';

interface Facility {
    id: number;
    nama: string;
    keterangan: string | null;
}

export default function MessFacilityPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [form, setForm] = useState({
        nama: '',
        keterangan: ''
    });

    const fetchFacilities = useCallback(async () => {
        try {
            const response = await api.get(`/mess/facilities?search=${search}`);
            setFacilities(response.data);
        } catch {
            toast.error('Gagal mengambil data fasilitas');
        }
    }, [search]);

    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    const handleSave = async () => {
        if (!form.nama) {
            toast.error('Nama fasilitas harus diisi');
            return;
        }

        try {
            if (editingFacility) {
                await api.put(`/mess/facilities/${editingFacility.id}`, form);
                toast.success('Fasilitas berhasil diperbarui');
            } else {
                await api.post('/mess/facilities', form);
                toast.success('Fasilitas berhasil ditambahkan');
            }
            setShowModal(false);
            fetchFacilities();
        } catch {
            toast.error('Gagal menyimpan fasilitas');
        }
    };

    const handleDeleteClick = (id: number, nama: string) => {
        setDeleteId(id);
        setDeleteName(nama);
        setIsDeleteDialogOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await api.delete(`/mess/facilities/${deleteId}`);
            toast.success('Fasilitas berhasil dihapus');
            fetchFacilities();
            setIsDeleteDialogOpen(false);
        } catch {
            toast.error('Gagal menghapus fasilitas');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                        <Gem className="w-6 h-6 text-primary" />
                        Master Fasilitas
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Pengelolaan daftar fasilitas kamar mess.</p>
                </div>
                <Button onClick={() => {
                    setEditingFacility(null);
                    setForm({ nama: '', keterangan: '' });
                    setShowModal(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" /> Fasilitas Baru
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari fasilitas..."
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
                                    <th className="text-left p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Fasilitas</th>
                                    <th className="text-left p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Keterangan</th>
                                    <th className="text-right p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {facilities.length > 0 ? facilities.map((f) => (
                                    <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Gem className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold uppercase">{f.nama}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{f.keterangan || '-'}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                                    setEditingFacility(f);
                                                    setForm({ nama: f.nama, keterangan: f.keterangan || '' });
                                                    setShowModal(true);
                                                }}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(f.id, f.nama)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-muted-foreground font-bold italic">
                                            Tidak ada data fasilitas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFacility ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}</DialogTitle>
                        <DialogDescription>
                            Isi detail fasilitas yang ingin Anda {editingFacility ? 'perbarui' : 'tambahkan'} ke daftar fasilitas mess.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Nama Fasilitas</label>
                            <Input
                                placeholder="Misal: AC, Wi-Fi, Laundry"
                                value={form.nama}
                                onChange={e => setForm({ ...form, nama: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase">Keterangan</label>
                            <Input
                                placeholder="Penjelasan singkat"
                                value={form.keterangan}
                                onChange={e => setForm({ ...form, keterangan: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button onClick={handleSave}>Simpan Fasilitas</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ModernDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={executeDelete}
                title="Hapus Fasilitas"
                description={`Apakah Anda yakin ingin menghapus fasilitas "${deleteName}"? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={isDeleting}
            />
        </div>
    );
}
