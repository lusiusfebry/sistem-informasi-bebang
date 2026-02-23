import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Printer,
    Edit3,
    Briefcase,
    MapPin,
    Calendar,
    Mail,
    Phone,
    User,
    CreditCard,
    Home,
    Heart,
    GraduationCap,
    ShieldCheck,
    FileText,
    Loader2,
    Users,
    Building2,
    Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import type { KaryawanDetail } from '@/types/karyawan';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const ProfilKaryawan = () => {
    const { id: empId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<KaryawanDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/karyawan/${empId}`);
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch employee detail', error);
                toast.error('Gagal mengambil data detail karyawan');
                navigate('/hr/karyawan');
            } finally {
                setIsLoading(false);
            }
        };
        if (empId) fetchDetail();
    }, [empId, navigate]);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-slate-500 font-black uppercase tracking-widest italic">Memuat Profil...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        try {
            return format(new Date(dateStr), 'dd MMMM yyyy', { locale: id });
        } catch {
            return dateStr;
        }
    };

    const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: React.ElementType }) => (
        <div className="flex flex-col space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </p>
            <p className="text-sm font-bold text-slate-700">{value || '-'}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/hr/karyawan')}
                    className="group h-10 rounded-xl px-4 font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Direktori
                </Button>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl px-6 font-black uppercase tracking-widest border-slate-200"
                        onClick={() => toast.info('Fitur cetak ID individu sedang disiapkan')}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Cetak ID
                    </Button>
                    <Button
                        className="h-10 rounded-xl px-6 font-black uppercase tracking-widest bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all"
                        onClick={() => navigate(`/hr/karyawan/${empId}/edit`)}
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profil
                    </Button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                </div>
                <div className="px-8 pb-8 -mt-16 relative flex flex-col md:flex-row items-end gap-6">
                    <Avatar className="w-32 h-32 border-[6px] border-white shadow-2xl rounded-3xl">
                        <AvatarImage src={data.foto_karyawan || ''} className="object-cover" />
                        <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                            {data.nama_lengkap.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">{data.nama_lengkap}</h1>
                            <Badge
                                variant="outline"
                                style={{ borderColor: data.status_karyawan.warna, color: data.status_karyawan.warna, backgroundColor: `${data.status_karyawan.warna}10` }}
                                className="text-xs font-black uppercase tracking-widest px-3 py-1 border-2"
                            >
                                {data.status_karyawan.nama}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-sm tracking-wider font-mono">NIK: {data.nomor_induk_karyawan}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-primary" />
                                <span className="text-sm">{data.posisi_jabatan.nama}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm">{data.lokasi_kerja.nama}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="rounded-3xl border-slate-100 shadow-sm bg-primary/[0.02]">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                            <Layers className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Divisi</p>
                            <p className="font-bold text-slate-700">{data.divisi.nama}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-slate-100 shadow-sm bg-primary/[0.02]">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Departemen</p>
                            <p className="font-bold text-slate-700">{data.department.nama}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-slate-100 shadow-sm bg-primary/[0.02]">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Tgl Bergabung</p>
                            <p className="font-bold text-slate-700">{formatDate(data.hr?.tanggal_masuk)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-slate-100 shadow-sm bg-primary/[0.02]">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Hub. Kerja</p>
                            <p className="font-bold text-slate-700">{data.hr?.jenis_hubungan_kerja?.nama || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="personal" className="w-full space-y-6">
                <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm h-14 w-full md:w-auto">
                    <TabsTrigger value="personal" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <User className="w-4 h-4 mr-2" />
                        Info Pribadi
                    </TabsTrigger>
                    <TabsTrigger value="pekerjaan" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Pekerjaan
                    </TabsTrigger>
                    <TabsTrigger value="keluarga" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <Heart className="w-4 h-4 mr-2" />
                        Keluarga
                    </TabsTrigger>
                    <TabsTrigger value="dokumen" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <FileText className="w-4 h-4 mr-2" />
                        Dokumen
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Biodata */}
                        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden lg:col-span-2">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Biodata & Identitas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                    <InfoRow label="Tempat, Tanggal Lahir" value={`${data.personal?.tempat_lahir || ''}, ${formatDate(data.personal?.tanggal_lahir)}`} />
                                    <InfoRow label="Jenis Kelamin" value={data.personal?.jenis_kelamin} />
                                    <InfoRow label="Agama" value={data.personal?.agama} />
                                    <InfoRow label="Golongan Darah" value={data.personal?.golongan_darah} />
                                    <InfoRow label="Nomor KTP" value={data.personal?.nomor_ktp} icon={CreditCard} />
                                    <InfoRow label="Nomor NPWP" value={data.personal?.nomor_npwp} />
                                    <InfoRow label="Status Pajak" value={data.personal?.status_pajak} />
                                    <InfoRow label="Status Pernikahan" value={data.personal?.status_pernikahan} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Kontak & Bank */}
                        <div className="space-y-6">
                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-6 py-4">
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Phone className="w-3 h-3" />
                                        Kontak
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <InfoRow label="Email Perusahaan" value={data.email_perusahaan} icon={Mail} />
                                    <InfoRow label="Nomor Handphone" value={data.nomor_handphone} icon={Phone} />
                                    <InfoRow label="Email Pribadi" value={data.personal?.email_pribadi} />
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-6 py-4">
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <CreditCard className="w-3 h-3" />
                                        Informasi Bank
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{data.personal?.nomor_rekening || '-'}</p>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{data.personal?.nama_bank}</p>
                                        <p className="text-xs font-bold text-slate-600 uppercase">{data.personal?.nama_pemegang_rekening}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alamat */}
                        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden lg:col-span-full">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Home className="w-4 h-4" />
                                    Informasi Domisili & KTP
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 border-b pb-2">Alamat KTP</h4>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            {data.personal?.alamat_ktp || 'Data alamat KTP belum tersedia.'}
                                            {data.personal?.kota_ktp && <span className="block mt-1 text-slate-500 font-bold uppercase text-[10px]">{data.personal.kota_ktp}, {data.personal.provinsi_ktp}</span>}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 border-b pb-2">Alamat Domisili</h4>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            {data.personal?.alamat_domisili || 'Data alamat domisili belum tersedia.'}
                                            {data.personal?.kota_domisili && <span className="block mt-1 text-slate-500 font-bold uppercase text-[10px]">{data.personal.kota_domisili}, {data.personal.provinsi_domisili}</span>}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="pekerjaan" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden lg:col-span-2">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Riwayat & Kontrak Kerja
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                    <InfoRow label="Tanggal Masuk Group" value={formatDate(data.hr?.tanggal_masuk_group)} />
                                    <InfoRow label="Tanggal Menjadi Permanent" value={formatDate(data.hr?.tanggal_permanent)} />
                                    <InfoRow label="Awal Kontrak" value={formatDate(data.hr?.tanggal_kontrak)} />
                                    <InfoRow label="Akhir Kontrak" value={formatDate(data.hr?.tanggal_akhir_kontrak)} />
                                    <InfoRow label="Point of Original (POO)" value={data.hr?.point_of_original} />
                                    <InfoRow label="Point of Hire (POH)" value={data.hr?.point_of_hire} />
                                    <InfoRow label="Siklus Pembayaran Gaji" value={data.hr?.siklus_pembayaran_gaji} />
                                    <InfoRow label="Atasan Langsung" value={data.atasan_langsung ? `${data.atasan_langsung.nama_lengkap} (${data.atasan_langsung.nomor_induk_karyawan})` : '-'} />
                                    <InfoRow label="Manager" value={data.manager ? `${data.manager.nama_lengkap} (${data.manager.nomor_induk_karyawan})` : '-'} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-6 py-4">
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <ShieldCheck className="w-3 h-3" />
                                        Golongan & Pangkat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <InfoRow label="Kategori Pangkat" value={data.hr?.kategori_pangkat?.nama} />
                                    <InfoRow label="Golongan" value={data.hr?.golongan?.nama} />
                                    <InfoRow label="Sub Golongan" value={data.hr?.sub_golongan?.nama} />
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-6 py-4">
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <GraduationCap className="w-3 h-3" />
                                        Pendidikan Terakhir
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border-none">
                                        {data.hr?.tingkat_pendidikan || '-'}
                                    </Badge>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 leading-tight mb-0.5">{data.hr?.nama_sekolah}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{data.hr?.bidang_studi} • {data.hr?.kota_sekolah}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Kontak Darurat */}
                        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden lg:col-span-full">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Kontak Darurat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {[1, 2].map(num => (
                                        <div key={num} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500" />
                                            <div className="relative">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-200 pb-3 mb-6">KONTAK DARURAT 0{num}</h4>
                                                <div className="space-y-5">
                                                    <InfoRow label="Nama Lengkap" value={num === 1 ? data.hr?.emergency_nama_1 : data.hr?.emergency_nama_2} />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InfoRow label="Nomor Telepon" value={num === 1 ? data.hr?.emergency_nomor_1 : data.hr?.emergency_nomor_2} icon={Phone} />
                                                        <InfoRow label="Hubungan" value={num === 1 ? data.hr?.emergency_hubungan_1 : data.hr?.emergency_hubungan_2} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="keluarga" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Anak */}
                        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Data Anak
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                {data.anak.length === 0 ? (
                                    <p className="text-sm font-bold text-slate-400 italic">Belum ada data anak.</p>
                                ) : (
                                    data.anak.sort((a, b) => a.urutan - b.urutan).map((child) => (
                                        <div key={child.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-primary shadow-sm border border-slate-100">
                                                    {child.urutan}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{child.nama_anak}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{child.jenis_kelamin} • {formatDate(child.tanggal_lahir)}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-400">Anak Ke-{child.urutan}</Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Saudara */}
                        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Data Saudara Kandung
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {data.saudara.length === 0 ? (
                                    <p className="text-sm font-bold text-slate-400 italic">Belum ada data saudara kandung.</p>
                                ) : (
                                    data.saudara.sort((a, b) => a.urutan - b.urutan).map((sibling) => (
                                        <div key={sibling.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{sibling.nama_saudara}</p>
                                                <Badge variant="secondary" className="text-[9px] font-black bg-white">{sibling.urutan}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InfoRow label="Pendidikan" value={sibling.pendidikan_terakhir} />
                                                <InfoRow label="Pekerjaan" value={sibling.pekerjaan} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="dokumen" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Lampiran & Dokumen Karyawan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <div className="max-w-xs">
                                <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Dokumen Segera Hadir</p>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed">Modul manajemen dokumen digital sedang dalam tahap sinkronisasi dengan storage sytem.</p>
                            </div>
                            <Button variant="outline" disabled className="h-10 rounded-xl px-6 font-black uppercase tracking-widest border-slate-200">
                                Unggah Dokumen
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
