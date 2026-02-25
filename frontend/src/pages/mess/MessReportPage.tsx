import { useState, useEffect } from 'react';
import {
    FileBarChart,
    PieChart,
    Building2,
    Wrench,
    Users,
    TrendingUp,
    Download,
    AlertTriangle,
    CheckCircle2,
    Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface OccupancyData {
    id: number;
    nama: string;
    totalCapacity: number;
    currentOccupants: number;
    occupancyRate: number;
    totalRooms: number;
    fullRooms: number;
    availableRooms: number;
}

interface MaintenanceData {
    stats: {
        total: number;
        dilaporkan: number;
        proses: number;
        selesai: number;
    };
    details: {
        id: number;
        kategori: string | null;
        deskripsi: string;
        status: string;
        tanggal_laporan: string;
        room: {
            nomor_kamar: string;
            mess: {
                nama: string;
            };
        };
    }[];
}

export default function MessReportPage() {
    const [occupancyReport, setOccupancyReport] = useState<OccupancyData[]>([]);
    const [maintenanceReport, setMaintenanceReport] = useState<MaintenanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [occRes, mainRes] = await Promise.all([
                api.get('/mess/reports/occupancy'),
                api.get('/mess/reports/maintenance')
            ]);
            setOccupancyReport(occRes.data);
            setMaintenanceReport(mainRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data laporan');
        } finally {
            setLoading(false);
        }
    };

    const totalCapacity = occupancyReport.reduce((acc, curr) => acc + curr.totalCapacity, 0);
    const totalOccupants = occupancyReport.reduce((acc, curr) => acc + curr.currentOccupants, 0);
    const overallOccupancyRate = totalCapacity > 0 ? (totalOccupants / totalCapacity) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                        <FileBarChart className="w-6 h-6 text-primary" />
                        Laporan Terpadu Mess
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Analisis okupansi, pemeliharaan, dan operasional seluruh unit mess.</p>
                </div>
                <Button variant="outline" className="font-bold border-2 hover:bg-muted" onClick={() => window.print()}>
                    <Download className="w-4 h-4 mr-2" />
                    CETAK LAPORAN
                </Button>
            </div>

            <Tabs defaultValue="ringkasan" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex bg-muted/20 p-1">
                    <TabsTrigger value="ringkasan" className="font-black uppercase text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <PieChart className="w-4 h-4 mr-2" /> Ringkasan
                    </TabsTrigger>
                    <TabsTrigger value="okupansi" className="font-black uppercase text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Building2 className="w-4 h-4 mr-2" /> Okupansi Detail
                    </TabsTrigger>
                    <TabsTrigger value="pemeliharaan" className="font-black uppercase text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Wrench className="w-4 h-4 mr-2" /> Pemeliharaan
                    </TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground font-bold animate-pulse italic mt-6 bg-white rounded-xl shadow-sm">
                        Memuat data laporan...
                    </div>
                ) : (
                    <>
                        {/* TAB: RINGKASAN */}
                        <TabsContent value="ringkasan" className="space-y-6 mt-6 animate-in fade-in zoom-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="border-none shadow-sm bg-primary/5">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Okupansi Total</p>
                                                <h3 className="text-2xl font-black mt-1 text-primary">{overallOccupancyRate.toFixed(1)}%</h3>
                                            </div>
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                        <Progress value={overallOccupancyRate} className="h-2 mt-4 bg-primary/10" />
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-950/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Total Penghuni</p>
                                                <h3 className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400">{totalOccupants}</h3>
                                            </div>
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-4 italic">TERHADAP {totalCapacity} KAPASITAS TOTAL</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-950/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Butuh Perbaikan</p>
                                                <h3 className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
                                                    {maintenanceReport?.stats.dilaporkan || 0}
                                                </h3>
                                            </div>
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-4 italic">LAPORAN STATUS "DILAPORKAN"</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm bg-green-50 dark:bg-green-950/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Terselesaikan</p>
                                                <h3 className="text-2xl font-black mt-1 text-green-600 dark:text-green-400">
                                                    {maintenanceReport?.stats.selesai || 0}
                                                </h3>
                                            </div>
                                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-4 italic">TOTAL PERBAIKAN SELESAI</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-black uppercase tracking-wider">Perbandingan per Mess</CardTitle>
                                        <CardDescription>Data sebaran penghuni pada masing-masing mess.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {occupancyReport.map((m) => (
                                            <div key={m.id} className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold uppercase">
                                                    <span>{m.nama}</span>
                                                    <span>{m.currentOccupants} / {m.totalCapacity}</span>
                                                </div>
                                                <Progress value={m.occupancyRate} className="h-2 bg-muted" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-black uppercase tracking-wider">Log Pemeliharaan Terbaru</CardTitle>
                                        <CardDescription>5 laporan kerusakan terakhir yang masuk.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {maintenanceReport?.details.slice(0, 5).map((item, idx) => (
                                                <div key={idx} className="p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                                                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                                        <Wrench className="w-3.5 h-3.5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                                                            Kamar {item.room.nomor_kamar} - {item.room.mess.nama}
                                                        </div>
                                                        <div className="text-[10px] font-medium text-muted-foreground line-clamp-1">{item.deskripsi}</div>
                                                        <div className="mt-1">
                                                            <Badge variant={item.status === 'Selesai' ? 'success' : item.status === 'Proses' ? 'secondary' : 'outline'} className="text-[9px] h-4 px-1">
                                                                {item.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* TAB: OKUPANSI DETAIL */}
                        <TabsContent value="okupansi" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-muted/10 pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-black uppercase tracking-wider">Tabel Okupansi Gedung</CardTitle>
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Cari mess..."
                                                className="pl-9 h-8 text-xs font-bold"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="bg-muted/5 border-b border-slate-100 dark:border-slate-800">
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Nama Mess</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Total Kamar</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Kamar Full</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Kamar Kosong</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-center">Tingkat Okupansi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {occupancyReport
                                                    .filter(m => m.nama.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map((m) => (
                                                        <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                                            <td className="p-4 font-black uppercase text-slate-800 dark:text-slate-200">{m.nama}</td>
                                                            <td className="p-4 font-bold">{m.totalRooms} Kamar</td>
                                                            <td className="p-4">
                                                                <Badge variant="outline" className="text-[10px] font-bold border-blue-200 bg-blue-50 text-blue-700">
                                                                    {m.fullRooms} Terisi Penuh
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4">
                                                                <Badge variant="outline" className="text-[10px] font-bold border-green-200 bg-green-50 text-green-700">
                                                                    {m.availableRooms} Tersedia
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Progress value={m.occupancyRate} className="h-1.5 w-24 bg-muted" />
                                                                    <span className="text-[10px] font-black">{m.occupancyRate.toFixed(1)}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB: PEMELIHARAAN */}
                        <TabsContent value="pemeliharaan" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-muted/10 pb-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-wider">Rekapitulasi Kerusakan & Perbaikan</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="bg-muted/5 border-b border-slate-100 dark:border-slate-800">
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Tanggal</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Mess / Kamar</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Kategori</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Deskripsi</th>
                                                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {maintenanceReport?.details.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                        <td className="p-4 text-[10px] font-bold uppercase text-muted-foreground">
                                                            {format(new Date(item.tanggal_laporan), 'dd/MM/yyyy', { locale: id })}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-black text-xs uppercase">{item.room.mess.nama}</div>
                                                            <div className="text-[10px] font-bold text-primary">Kamar {item.room.nomor_kamar}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant="secondary" className="text-[10px] font-bold uppercase">{item.kategori || 'UMUM'}</Badge>
                                                        </td>
                                                        <td className="p-4 text-xs font-medium max-w-xs">{item.deskripsi}</td>
                                                        <td className="p-4 text-right">
                                                            <Badge variant={item.status === 'Selesai' ? 'success' : item.status === 'Proses' ? 'secondary' : 'outline'} className="text-[9px] font-black uppercase">
                                                                {item.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
