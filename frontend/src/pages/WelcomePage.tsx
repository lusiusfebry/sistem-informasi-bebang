import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Gem,
    LogOut,
    Users,
    Box,
    Utensils,
    Building2,
    ShieldCheck,
    LayoutDashboard,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface ModuleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    disabled?: boolean;
    color: string;
}

function ModuleCard({ title, description, icon, path, disabled, color }: ModuleCardProps) {
    const navigate = useNavigate();

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${disabled ? 'opacity-60 grayscale' : 'cursor-pointer'}`}
            onClick={() => !disabled && navigate(path)}
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Buka Modul <ArrowRight className="ml-2 w-4 h-4" />
                </div>
            </CardContent>
            {disabled && (
                <div className="absolute top-3 right-3 shrink-0">
                    <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Coming Soon</span>
                </div>
            )}
        </Card>
    );
}

export default function WelcomePage() {
    const navigate = useNavigate();
    const [user] = useState<{ nama: string; nik: string; role: string } | null>(() => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        toast.success('Berhasil keluar dari sistem');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <Gem className="text-primary-foreground w-6 h-6" />
                        </div>
                        <span className="text-lg font-black tracking-tighter italic">BEBANG <span className="text-primary">System</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-muted/50 border border-muted-foreground/10">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold leading-none">{user.nama}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{user.role} • {user.nik}</span>
                            </div>
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {user.nama.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="container px-4 py-12 sm:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                        Selamat Datang, <span className="text-primary">{user.nama.split(' ')[0]}!</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                        Pilih modul kerja di bawah ini untuk memulai aktivitas Anda. Bebang Sistem Informasi membantu Anda mengelola data secara efisien dan terintegrasi.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModuleCard
                        title="Human Resources"
                        description="Manajemen database karyawan, master data, dan administrasi HR terpusat."
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                        path="/hr"
                        color="bg-blue-600"
                    />
                    <ModuleCard
                        title="Inventory"
                        description="Kontrol stok barang, alat kerja, dan manajemen gudang site Taliabu."
                        icon={<Box className="w-6 h-6 text-emerald-600" />}
                        path="/inventory"
                        disabled
                        color="bg-emerald-600"
                    />
                    <ModuleCard
                        title="Mess Management"
                        description="Pengaturan hunian mess, reservasi, dan fasilitas akomodasi karyawan."
                        icon={<Utensils className="w-6 h-6 text-orange-600" />}
                        path="/hr/mess"
                        color="bg-orange-600"
                    />
                    <ModuleCard
                        title="Building Management"
                        description="Pemeliharaan aset bangunan dan infrastruktur di area operasional."
                        icon={<Building2 className="w-6 h-6 text-purple-600" />}
                        path="/building"
                        disabled
                        color="bg-purple-600"
                    />
                    <ModuleCard
                        title="Access Control"
                        description="Manajemen hak akses pengguna dan keamanan sistem informasi."
                        icon={<ShieldCheck className="w-6 h-6 text-rose-600" />}
                        path="/hr/users"
                        color="bg-rose-600"
                    />
                    <ModuleCard
                        title="Dashboard Analysis"
                        description="Visualisasi data dan pelaporan performa operasional site."
                        icon={<LayoutDashboard className="w-6 h-6 text-slate-600" />}
                        path="/dashboard"
                        disabled
                        color="bg-slate-600"
                    />
                </div>

                {/* Footer Info */}
                <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-lg font-bold mb-1">Butuh bantuan menggunakan sistem?</h4>
                        <p className="text-sm text-muted-foreground font-medium">Tim IT Support kami siap membantu Anda 24/7 di site Taliabu.</p>
                    </div>
                    <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90">
                        Hubungi IT Support
                    </Button>
                </div>
            </main>
        </div>
    );
}
