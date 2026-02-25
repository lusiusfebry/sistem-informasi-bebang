import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    Loader2,
    CheckCircle2,
    Circle,
    Package,
    Activity,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import { PermissionGuard } from '@/components/PermissionGuard';

interface Permission {
    id: number;
    module: string;
    feature: string | null;
    action: string;
    deskripsi: string | null;
    group_id: number | null;
}

interface GroupedPermission {
    module: string;
    features: {
        [key: string]: Permission[];
    };
}

export default function PermissionMatrixPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const roleId = searchParams.get('roleId');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [role, setRole] = useState<any>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    useEffect(() => {
        if (!roleId) {
            toast.error('Role ID tidak ditemukan');
            navigate('/access/roles');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [roleRes, permRes] = await Promise.all([
                    api.get(`/access/roles`), // We'll find the specific role from the list for now
                    api.get('/access/permissions')
                ]);

                const currentRole = roleRes.data.find((r: any) => r.id === Number(roleId));
                if (!currentRole) {
                    toast.error('Role tidak ditemukan');
                    navigate('/access/roles');
                    return;
                }

                setRole(currentRole);
                setPermissions(permRes.data);
                setSelectedPermissions(currentRole.permissions.map((p: any) => p.permission_id));
            } catch (error) {
                console.error('Fetch permissions error', error);
                toast.error('Gagal mengambil data akses');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roleId, navigate]);

    const handleToggle = (id: number) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/access/roles/${roleId}`, {
                permissionIds: selectedPermissions
            });
            toast.success('Hak akses berhasil diperbarui');
        } catch (error) {
            toast.error('Gagal menyimpan perubahan');
        } finally {
            setSaving(false);
        }
    };

    // Group permissions by module and then feature
    const grouped = permissions.reduce((acc: GroupedPermission[], p) => {
        let mod = acc.find(m => m.module === p.module);
        if (!mod) {
            mod = { module: p.module, features: {} };
            acc.push(mod);
        }

        const featureKey = p.feature || 'General';
        if (!mod.features[featureKey]) {
            mod.features[featureKey] = [];
        }
        mod.features[featureKey].push(p);

        return acc;
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Menyiapkan Matriks Akses...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(52,211,153,0.05)_0%,transparent_70%)]" />
                <div className="relative z-10 flex items-center gap-5">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/access/roles')}
                        className="p-3 h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Matriks Permission</h1>
                            <Badge className="bg-primary/20 text-primary border-primary/30 rounded-lg px-3 py-1 font-black text-[10px] uppercase italic">
                                {role?.nama}
                            </Badge>
                        </div>
                        <p className="text-slate-400 font-medium text-sm tracking-wide mt-1">Konfigurasi hak akses granular untuk peranan ini.</p>
                    </div>
                </div>
                <div className="relative z-10">
                    <PermissionGuard module="Security" feature="Permissions" action="Update">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 flex gap-3"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Simpan Perubahan
                        </Button>
                    </PermissionGuard>
                </div>
            </div>

            {/* Matrix Content */}
            <div className="space-y-6">
                {grouped.map((group) => (
                    <div key={group.module} className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-primary" />
                                <h2 className="font-black text-slate-900 uppercase tracking-tighter italic">MODUL: {group.module}</h2>
                            </div>
                            <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold uppercase text-[9px]">
                                {Object.keys(group.features).length} Features
                            </Badge>
                        </div>
                        <div className="p-4 space-y-4">
                            {Object.entries(group.features).map(([feature, perms]) => (
                                <div key={feature} className="p-6 rounded-2xl bg-slate-50/50 border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/30 transition-colors">
                                            {feature === 'General' ? <Activity className="w-5 h-5 text-slate-400" /> : <Lock className="w-5 h-5 text-slate-400" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{feature}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Hak Akses Tersedia</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {perms.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleToggle(p.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all active:scale-95 ${selectedPermissions.includes(p.id)
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                    }`}
                                            >
                                                {selectedPermissions.includes(p.id) ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    <Circle className="w-4 h-4 opacity-50" />
                                                )}
                                                <span className="font-black text-[10px] uppercase tracking-widest">
                                                    {p.action}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Float Action for Mobile/Quick Save */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden">
                <PermissionGuard module="Security" feature="Permissions" action="Update">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-2xl flex gap-3 ring-4 ring-white"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Simpan
                    </Button>
                </PermissionGuard>
            </div>
        </div>
    );
}
