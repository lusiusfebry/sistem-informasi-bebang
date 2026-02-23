import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    RefreshCw,
    Shield,
    ShieldCheck,
    UserCircle,
    Loader2,
    X,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

interface User {
    id: number;
    nik: string;
    nama: string;
    role: string;
    karyawan_id: number | null;
    created_at: string;
    karyawan?: {
        nama_lengkap: string;
        foto_karyawan: string | null;
        posisi_jabatan?: {
            nama: string;
        }
    }
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        nik: '',
        nama: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/users?search=${search}`);
                setUsers(response.data);
            } catch (error) {
                console.error('Fetch users error', error);
                toast.error('Gagal mengambil data pengguna');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [search]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
                toast.success('User berhasil diperbarui');
            } else {
                await api.post('/users', formData);
                toast.success('User berhasil dibuat');
            }
            setShowModal(false);
            // Re-fetch users using an inline search if necessary or just trigger a re-render
            const response = await api.get(`/users?search=${search}`);
            setUsers(response.data);
        } catch (error: unknown) {
            const message = error && typeof error === 'object' && 'response' in error
                ? (error as { response: { data: { message: string } } }).response.data.message
                : error instanceof Error ? error.message : 'Terjadi kesalahan';
            toast.error(message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Anda yakin ingin menghapus user ini?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User berhasil dihapus');
            const response = await api.get(`/users?search=${search}`);
            setUsers(response.data);
        } catch {
            toast.error('Gagal menghapus user');
        }
    };

    const handleSync = async (id: number) => {
        try {
            await api.post(`/users/${id}/sync`);
            toast.success('Koneksi profil berhasil diperbarui');
            const response = await api.get(`/users?search=${search}`);
            setUsers(response.data);
        } catch (error: unknown) {
            const message = error && typeof error === 'object' && 'response' in error
                ? (error as { response: { data: { message: string } } }).response.data.message
                : error instanceof Error ? error.message : 'Sinkronisasi gagal';
            toast.error(message);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ nik: '', nama: '', password: '', role: 'user' });
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            nik: user.nik,
            nama: user.nama,
            password: '',
            role: user.role
        });
        setShowModal(true);
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="bg-primary/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Manajemen Pengguna</h1>
                        <p className="text-slate-400 font-medium text-sm tracking-wide">Kelola akun dan hak akses personil sistem.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Cari NIK atau Nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-12 w-full md:w-[300px] rounded-2xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 text-white placeholder:text-slate-500 transition-all font-['Inter']"
                        />
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        User Baru
                    </Button>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pengguna</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Informasi Akses</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Profil</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                                <th className="p-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Memuat data pengguna...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Tidak ada pengguna ditemukan</p>
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                {user.karyawan?.foto_karyawan ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/foto/${user.karyawan.foto_karyawan}`}
                                                        alt={user.nama}
                                                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 ring-offset-2"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 ring-2 ring-slate-50 ring-offset-2">
                                                        <UserCircle className="w-6 h-6" />
                                                    </div>
                                                )}
                                                {user.role === 'admin' && (
                                                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-lg">
                                                        <ShieldCheck className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{user.nama}</p>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest italic">{user.karyawan?.posisi_jabatan?.nama || 'Sistem Non-Pegawai'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-sm">
                                        <p className="font-['JetBrains_Mono'] text-primary font-black">{user.nik}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Dibuat: {new Date(user.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-6">
                                        {user.karyawan_id ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                                                Terhubung
                                            </Badge>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-rose-400 border-rose-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                                                    Terputus
                                                </Badge>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-6 h-6 rounded-md hover:bg-primary/10 hover:text-primary transition-all"
                                                    onClick={() => handleSync(user.id)}
                                                    title="Hubungkan dengan Profil"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.15em]">
                                                    <Shield className="w-3 h-3" />
                                                    Administrator
                                                </div>
                                            ) : (
                                                <div className="text-slate-500 font-black text-[10px] uppercase tracking-[0.15em]">
                                                    User Biasa
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md transition-all">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-slate-100 p-2 shadow-2xl">
                                                <DropdownMenuItem
                                                    onClick={() => openEditModal(user)}
                                                    className="rounded-xl p-3 focus:bg-primary/5 focus:text-primary group cursor-pointer"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-3" />
                                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-600 group-focus:text-primary">Perbarui Data</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleSync(user.id)}
                                                    className="rounded-xl p-3 focus:bg-primary/5 focus:text-primary group cursor-pointer"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-3" />
                                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-600 group-focus:text-primary">Sync Profil</span>
                                                </DropdownMenuItem>
                                                <div className="h-px bg-slate-50 my-2" />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(user.id)}
                                                    className="rounded-xl p-3 focus:bg-rose-50 focus:text-rose-600 group cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-3" />
                                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-600 group-focus:text-rose-600">Hapus Akses</span>
                                                </DropdownMenuItem>
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
                <DialogContent className="sm:max-w-[450px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-slate-900 text-white relative">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                            {editingUser ? <Edit2 className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                            {editingUser ? 'Perbarui User' : 'User Sistem Baru'}
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Induk Karyawan (NIK)</label>
                                <Input
                                    value={formData.nik}
                                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                                    placeholder="xx-xxxxx"
                                    required
                                    disabled={!!editingUser}
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary focus:ring-primary/20 font-['JetBrains_Mono'] font-bold text-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Tampilan</label>
                                <Input
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Nama Pengguna"
                                    required
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary focus:ring-primary/20 font-black uppercase text-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    {editingUser ? 'Ganti Password (Dapat dikosongkan)' : 'Password Awal'}
                                </label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required={!editingUser}
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Peran dalam Sistem</label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary/20 font-['Inter'] font-bold">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 p-2">
                                        <SelectItem value="user" className="rounded-xl p-3 font-bold text-xs uppercase tracking-widest">User Biasa</SelectItem>
                                        <SelectItem value="admin" className="rounded-xl p-3 font-bold text-xs uppercase tracking-widest text-amber-600">Administrator</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    editingUser ? 'Simpan Perubahan' : 'Buat Akun'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
