import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    ShieldCheck,
    Loader2,
    X,
    Key,
    Users
} from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import api from '@/lib/api';
import ModernDeleteDialog from '@/components/master/ModernDeleteDialog';

interface Role {
    id: number;
    nama: string;
    deskripsi: string | null;
    status: string;
    _count?: {
        users: number;
    };
    permissions?: any[];
}

export default function RoleManagementPage() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        nama: '',
        deskripsi: '',
        status: 'Aktif'
    });

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/access/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Fetch roles error', error);
            toast.error('Gagal mengambil data role');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingRole) {
                await api.put(`/access/roles/${editingRole.id}`, formData);
                toast.success('Role berhasil diperbarui');
            } else {
                await api.post('/access/roles', formData);
                toast.success('Role berhasil dibuat');
            }
            setShowModal(false);
            fetchRoles();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!roleToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/access/roles/${roleToDelete.id}`);
            toast.success('Role berhasil dihapus');
            setIsDeleteDialogOpen(false);
            fetchRoles();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus role');
        } finally {
            setIsDeleting(false);
        }
    };

    const openCreateModal = () => {
        setEditingRole(null);
        setFormData({ nama: '', deskripsi: '', status: 'Aktif' });
        setShowModal(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setFormData({
            nama: role.nama,
            deskripsi: role.deskripsi || '',
            status: role.status
        });
        setShowModal(true);
    };

    const filteredRoles = roles.filter(r =>
        r.nama.toLowerCase().includes(search.toLowerCase()) ||
        r.deskripsi?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="bg-primary/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Manajemen Role</h1>
                        <p className="text-slate-400 font-medium text-sm tracking-wide">Atur peranan dan tingkatan akses dalam sistem.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Cari role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-12 w-full md:w-[300px] rounded-2xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 text-white placeholder:text-slate-500 transition-all font-['Inter']"
                        />
                    </div>
                    <PermissionGuard module="Security" feature="Roles" action="Create">
                        <Button
                            onClick={openCreateModal}
                            className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Role Baru
                        </Button>
                    </PermissionGuard>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nama Role</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deskripsi</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pengguna</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="p-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Memuat data role...</p>
                                    </td>
                                </tr>
                            ) : filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Tidak ada role ditemukan</p>
                                    </td>
                                </tr>
                            ) : filteredRoles.map((role) => (
                                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                                <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                                            </div>
                                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{role.nama}</p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm text-slate-500 font-medium max-w-[300px] truncate">{role.deskripsi || '-'}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="font-black text-slate-900 text-sm">{role._count?.users || 0}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">User</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <Badge className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider ${role.status === 'Aktif'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                                            : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50'
                                            }`}>
                                            {role.status}
                                        </Badge>
                                    </td>
                                    <td className="p-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md transition-all">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 p-2 shadow-2xl">
                                                <PermissionGuard module="Security" feature="Roles" action="Update">
                                                    <DropdownMenuItem
                                                        onClick={() => openEditModal(role)}
                                                        className="rounded-xl p-3 focus:bg-primary/5 focus:text-primary group cursor-pointer"
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-3" />
                                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-600 group-focus:text-primary">Edit Role</span>
                                                    </DropdownMenuItem>
                                                </PermissionGuard>

                                                <PermissionGuard module="Security" feature="Permissions" action="Read">
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/access/permissions?roleId=${role.id}`)}
                                                        className="rounded-xl p-3 focus:bg-primary/5 focus:text-primary group cursor-pointer"
                                                    >
                                                        <Key className="w-4 h-4 mr-3" />
                                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-600 group-focus:text-primary">Atur Permission</span>
                                                    </DropdownMenuItem>
                                                </PermissionGuard>

                                                <div className="h-px bg-slate-50 my-2" />

                                                <PermissionGuard module="Security" feature="Roles" action="Delete">
                                                    <DropdownMenuItem
                                                        onClick={() => { setRoleToDelete(role); setIsDeleteDialogOpen(true); }}
                                                        className="rounded-xl p-3 focus:bg-rose-50 focus:text-rose-600 group cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-600 group-focus:text-rose-600">Hapus Role</span>
                                                    </DropdownMenuItem>
                                                </PermissionGuard>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Create/Edit */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-[500px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-slate-900 text-white relative">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                            {editingRole ? <Edit2 className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                            {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowModal(false)}
                            className="absolute right-6 top-6 text-slate-400 hover:text-white rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="p-8 space-y-6 bg-white">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Role</label>
                                <Input
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="e.g., HR ADMIN"
                                    required
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary focus:ring-primary/20 font-black uppercase text-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi</label>
                                <Input
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Penjelasan singkat peran ini"
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary focus:ring-primary/20 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-xs"
                                onClick={() => setShowModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={formLoading}
                                className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            >
                                {formLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    editingRole ? 'Simpan Perubahan' : 'Buat Role'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ModernDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Hapus Role"
                description={`Apakah Anda yakin ingin menghapus role "${roleToDelete?.nama}"? Anggota role ini akan kehilangan hak akses terkait.`}
                itemName={roleToDelete?.nama}
            />
        </div>
    );
}
