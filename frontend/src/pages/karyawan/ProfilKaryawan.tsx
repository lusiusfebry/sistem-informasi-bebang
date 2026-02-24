import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
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
    ShieldCheck,
    FileText,
    Loader2,
    Users,
    Building2,
    Layers,
    Trash2,
    Paperclip,
    Download,
    Eye,
    UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import type { KaryawanDetail } from '@/types/karyawan';
import { toast } from 'sonner';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { ModalCetakIDCard } from '@/components/ModalCetakIDCard';

export const ProfilKaryawan = () => {
    const { id: empId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<KaryawanDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [docName, setDocName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [showCetakModal, setShowCetakModal] = useState(false);

    const fetchDetail = useCallback(async () => {
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
    }, [empId, navigate]);

    useEffect(() => {
        if (empId) fetchDetail();
    }, [empId, fetchDetail]);

    useEffect(() => {
        const fetchQrCode = async () => {
            if (!empId) return;
            try {
                const response = await api.get(`/karyawan/${empId}/qrcode`, {
                    responseType: 'blob'
                });
                const reader = new FileReader();
                reader.readAsDataURL(response.data);
                reader.onloadend = () => {
                    setQrCodeUrl(reader.result as string);
                };
            } catch (error) {
                console.error('Failed to fetch QR code', error);
            }
        };
        if (empId) fetchQrCode();
    }, [empId]);

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

    const getMasaKerja = (startDate: string | null | undefined) => {
        if (!startDate) return '-';
        const start = new Date(startDate);
        const now = new Date();
        const years = differenceInYears(now, start);
        const months = differenceInMonths(now, start) % 12;

        let result = '';
        if (years > 0) result += `${years} Tahun`;
        if (months > 0) result += `${years > 0 ? ', ' : ''}${months} Bulan`;
        return result || 'Baru Bergabung';
    };

    const handleUploadDoc = async () => {
        if (!selectedFile || !docName) {
            toast.error('Nama dokumen dan file wajib diisi');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('nama_dokumen', docName);

        setIsUploading(true);
        try {
            await api.post(`/karyawan/${empId}/dokumen`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Dokumen berhasil diunggah');
            setDocName('');
            setSelectedFile(null);
            fetchDetail(); // Refresh data
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Gagal mengunggah dokumen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDoc = async (docId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;

        try {
            await api.delete(`/karyawan/dokumen/${docId}`);
            toast.success('Dokumen berhasil dihapus');
            fetchDetail(); // Refresh data
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Gagal menghapus dokumen');
        }
    };

    const getFileIcon = (type: string | null) => {
        if (type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (type?.includes('image')) return <Eye className="w-5 h-5 text-blue-500" />;
        return <Paperclip className="w-5 h-5 text-slate-400" />;
    };


    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <nav className="flex text-sm text-slate-500 dark:text-slate-400">
                <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
                <span className="mx-2">/</span>
                <button onClick={() => navigate('/hr/karyawan')} className="hover:text-primary">Data Karyawan</button>
                <span className="mx-2">/</span>
                <span className="font-semibold text-slate-900 dark:text-white">Detail Profil</span>
            </nav>

            {/* Employee Header Card & Content wrapped in Tabs */}
            <Tabs defaultValue="personal" className="w-full space-y-6">
                <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
                    {/* Background decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="size-32 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-md ring-4 ring-white dark:ring-slate-800">
                                {data.foto_karyawan ? (
                                    <img src={data.foto_karyawan} alt={data.nama_lengkap} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-black">
                                        {data.nama_lengkap.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                )}
                            </div>
                            <button
                                className="absolute bottom-2 right-2 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                                onClick={() => navigate(`/hr/karyawan/${empId}/edit`)}
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-1 mb-3">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight uppercase">{data.nama_lengkap}</h1>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    <CreditCard className="w-4 h-4" />
                                    <span>NIK: {data.nomor_induk_karyawan}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-1" />
                                    <Badge
                                        className="px-2 py-0.5 rounded-full text-xs font-semibold border-none"
                                        style={{
                                            backgroundColor: `${data.status_karyawan.warna}20`,
                                            color: data.status_karyawan.warna
                                        }}
                                    >
                                        {data.status_karyawan.nama}
                                    </Badge>
                                </div>
                            </div>

                            {/* Job Details Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mt-4">
                                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-1">Posisi</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{data.posisi_jabatan.nama}</span>
                                </div>
                                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-1">Divisi</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{data.divisi.nama}</span>
                                </div>
                                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-1">Departemen</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{data.department.nama}</span>
                                </div>
                                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-1">Site</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{data.lokasi_kerja.nama}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code & Actions */}
                        <div className="flex flex-col items-center md:items-end gap-4 ml-auto min-w-[120px]">
                            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                                ) : (
                                    <div className="w-24 h-24 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 w-full justify-end">
                                <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none h-10 px-4 font-bold text-primary bg-primary/10 hover:bg-primary/20 border-none rounded-lg transition-colors"
                                    onClick={() => navigate(`/hr/karyawan/${empId}/edit`)}
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    className="flex-1 md:flex-none h-10 px-4 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    onClick={() => setShowCetakModal(true)}
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Cetak
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 -mx-6 px-6">
                        <TabsList className="bg-transparent h-auto p-0 flex gap-6 md:gap-8 overflow-x-auto">
                            <TabsTrigger
                                value="personal"
                                className="pb-3 pt-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent font-semibold text-sm whitespace-nowrap flex items-center gap-2 shadow-none transition-all"
                            >
                                <User className="w-4 h-4" />
                                Personal Information
                            </TabsTrigger>
                            <TabsTrigger
                                value="pekerjaan"
                                className="pb-3 pt-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent font-semibold text-sm whitespace-nowrap flex items-center gap-2 shadow-none transition-all"
                            >
                                <Briefcase className="w-4 h-4" />
                                Informasi HR
                            </TabsTrigger>
                            <TabsTrigger
                                value="keluarga"
                                className="pb-3 pt-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent font-semibold text-sm whitespace-nowrap flex items-center gap-2 shadow-none transition-all"
                            >
                                <Users className="w-4 h-4" />
                                Informasi Keluarga
                            </TabsTrigger>
                            <TabsTrigger
                                value="dokumen"
                                className="pb-3 pt-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent font-semibold text-sm whitespace-nowrap flex items-center gap-2 shadow-none transition-all"
                            >
                                <FileText className="w-4 h-4" />
                                Dokumen
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="personal" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Column 1: Biodata & Identifikasi */}
                        <div className="space-y-6 xl:col-span-2">
                            {/* Biodata Diri */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Biodata Diri</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Lengkap</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.nama_lengkap}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tempat Lahir</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.tempat_lahir || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Lahir</label>
                                        <div className="relative">
                                            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{formatDate(data.personal?.tanggal_lahir)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Jenis Kelamin</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.jenis_kelamin || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Golongan Darah</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.golongan_darah || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status Pernikahan</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.status_pernikahan || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Identifikasi & Dokumen */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Identifikasi & Dokumen</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Agama</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.agama || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kewarganegaraan</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">WNI</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor KTP (NIK)</label>
                                        <div className="flex gap-2">
                                            <p className="flex-1 text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.personal?.nomor_ktp || '-'}</p>
                                            <button
                                                className="p-2 text-slate-400 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                                                onClick={() => {
                                                    if (data.personal?.nomor_ktp) {
                                                        navigator.clipboard.writeText(data.personal.nomor_ktp);
                                                        toast.success('NIK berhasil disalin');
                                                    }
                                                }}
                                            >
                                                <Printer className="w-4 h-4" /> {/* Use generic icon or copy icon */}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor KK</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.personal?.nomor_kartu_keluarga || '-'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">NPWP</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.personal?.nomor_npwp || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Address, Financial, Mess */}
                        <div className="space-y-6">
                            {/* Alamat & Kontak */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Alamat & Kontak</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Pribadi</label>
                                        <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{data.personal?.email_pribadi || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor Telepon</label>
                                        <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono italic tracking-wider">{data.nomor_handphone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Alamat Domisili</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 min-h-[80px]">
                                            {data.personal?.alamat_domisili || '-'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kota</label>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.kota_domisili || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kode Pos</label>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.provinsi_domisili || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rekening Bank */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rekening Bank</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Bank</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.nama_bank || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor Rekening</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-widest">{data.personal?.nomor_rekening || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pemilik Rekening</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.nama_pemegang_rekening || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mess Information */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                        <Home className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Informasi Mess</h3>
                                </div>
                                {data.mess_room ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Home className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">{data.mess_room.mess.nama}</p>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kamar {data.mess_room.nomor_kamar}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs font-bold text-slate-400 italic text-center py-2">Tidak di Mess</p>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pekerjaan" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Status & Data Kontrak */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status & Data Kontrak</h3>
                                </div>
                                <Badge
                                    className="px-3 py-1 rounded-full text-xs font-semibold border-none animate-pulse"
                                    style={{
                                        backgroundColor: `${data.status_karyawan.warna}20`,
                                        color: data.status_karyawan.warna
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                                    {data.status_karyawan.nama}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor SK / Kontrak</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono tracking-wider">SK-{new Date().getFullYear()}/HR/00{data.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tipe Kontrak</label>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 flex-1">{data.hr?.jenis_hubungan_kerja?.nama || '-'}</p>
                                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100">Fixed Term</Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Mulai</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono">{formatDate(data.hr?.tanggal_kontrak)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Berakhir</label>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono flex-1">{formatDate(data.hr?.tanggal_akhir_kontrak)}</p>
                                        <Badge variant="secondary" className="text-[10px]">365 Hari</Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Bergabung</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono">{formatDate(data.hr?.tanggal_masuk_group)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Masa Kerja Total</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{getMasaKerja(data.hr?.tanggal_masuk_group)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Golongan / Pangkat</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.golongan?.nama || '-'} / {data.hr?.sub_golongan?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kategori Pangkat</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.kategori_pangkat?.nama || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Costing & Penugasan */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Costing & Penugasan</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Layers className="w-3 h-3" /> Cost Center
                                        </span>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Production - 01</p>
                                        <p className="text-xs text-slate-500 font-mono tracking-tighter">CC Code: PRD-TAL-001</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Lokasi Penugasan
                                        </span>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{data.lokasi_kerja.nama}</p>
                                        <p className="text-xs text-slate-500">North Maluku Region</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Siklus Penggajian
                                        </span>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{data.hr?.siklus_pembayaran_gaji || 'Bulanan (Monthly)'}</p>
                                        <p className="text-xs text-slate-500">Cut-off: Tanggal 25</p>
                                    </div>
                                </div>
                            </div>

                            {/* Atasan Card */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b pb-2 border-slate-50 dark:border-slate-700/50">Struktur Pelaporan</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">AL</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 font-medium leading-none mb-1">Atasan Langsung</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{data.atasan_langsung?.nama_lengkap || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-orange-500/10 text-orange-600 text-xs font-bold">MN</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 font-medium leading-none mb-1">Manager</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{data.manager?.nama_lengkap || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pergerakan Karir (Full Width) */}
                        <div className="xl:col-span-2 bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pergerakan Karir & Mutasi</h3>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary/80">Lihat Semua</Button>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/50">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Efektif</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Pergerakan</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Posisi / Lokasi</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor SK</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {data.hr?.tanggal_mutasi ? (
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono italic">{formatDate(data.hr.tanggal_mutasi)}</td>
                                                <td className="px-6 py-4">
                                                    <Badge className="bg-orange-50 text-orange-600 border-none px-2 py-0.5 rounded text-[10px] font-bold">Mutasi</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{data.lokasi_kerja.nama}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">Prev: {data.hr.lokasi_sebelumnya?.nama || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-400">-</td>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic text-sm font-medium bg-slate-50/30 dark:bg-slate-800/20">
                                                    Belum ada riwayat pergerakan
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="keluarga" className="space-y-6 focus-visible:outline-none">
                    <div className="space-y-8">
                        {/* Data Pasangan */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Pasangan (Spouse)</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified</Badge>
                                    <Badge className="bg-indigo-50 text-indigo-600 border-none px-2 py-1 rounded text-[10px] font-bold">Anak Ke-{data.keluarga?.anak_ke || '-'}</Badge>
                                    <Badge className="bg-purple-50 text-purple-600 border-none px-2 py-1 rounded text-[10px] font-bold">{data.keluarga?.jumlah_saudara_kandung || '0'} Bersaudara</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Lengkap</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.nama_pasangan || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pekerjaan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.pekerjaan_pasangan || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Menikah</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.personal?.tanggal_menikah)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status Pernikahan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 uppercase tracking-tighter">{data.personal?.status_pernikahan || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Data Anak */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Identitas Anak (Children)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.anak.length === 0 ? (
                                    <p className="text-xs font-bold text-slate-400 italic py-2 md:col-span-2 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">Belum ada data anak.</p>
                                ) : (
                                    data.anak.sort((a, b) => a.urutan - b.urutan).map((child) => (
                                        <div key={child.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group hover:border-primary/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-black text-primary shadow-sm border border-slate-100 dark:border-slate-700">
                                                    {child.urutan}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight uppercase mb-0.5">{child.nama_anak}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{child.jenis_kelamin} • {formatDate(child.tanggal_lahir)}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Anak Ke-{child.urutan}</Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Saudara Kandung */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saudara Kandung (Siblings)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.saudara.length === 0 ? (
                                    <p className="text-xs font-bold text-slate-400 italic py-2 md:col-span-2 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">Belum ada data saudara kandung.</p>
                                ) : (
                                    data.saudara.sort((a, b) => a.urutan - b.urutan).map((sibling) => (
                                        <div key={sibling.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-primary/30 transition-colors">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{sibling.nama_saudara}</p>
                                                <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-none text-[10px]">{sibling.urutan}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Pendidikan</label>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{sibling.pendidikan_terakhir || '-'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Pekerjaan</label>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{sibling.pekerjaan || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Orang Tua & Mertua */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Orang Tua & Mertua</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-50 dark:border-slate-700/50">Orang Tua Kandung</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-500 font-medium mb-1">Nama Ayah</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{data.personal?.nama_ayah || '-'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-500 font-medium mb-1">Nama Ibu</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{data.personal?.nama_ibu || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-50 dark:border-slate-700/50">Mertua (In-Laws)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-500 font-medium mb-1">Nama Ayah Mertua</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">{data.keluarga?.nama_ayah_mertua || '-'}</p>
                                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase">Pendidikan</p>
                                                    <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{data.keluarga?.pendidikan_terakhir_ayah_mertua || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase">Pekerjaan</p>
                                                    <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{data.keluarga?.pekerjaan_ayah_mertua || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-500 font-medium mb-1">Nama Ibu Mertua</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">{data.keluarga?.nama_ibu_mertua || '-'}</p>
                                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase">Pendidikan</p>
                                                    <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{data.keluarga?.pendidikan_terakhir_ibu_mertua || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase">Pekerjaan</p>
                                                    <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{data.keluarga?.pekerjaan_ibu_mertua || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="dokumen" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Upload Panel */}
                        <div className="xl:col-span-1 space-y-6">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-[#1A2633]">
                                <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                        <UploadCloud className="w-4 h-4 text-primary" />
                                        Unggah Dokumen Baru
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Dokumen</label>
                                        <input
                                            type="text"
                                            value={docName}
                                            onChange={(e) => setDocName(e.target.value)}
                                            placeholder="Contoh: KTP, KK, Sertifikat"
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih File</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full h-24 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 group-hover:border-primary/50 transition-colors">
                                                <Paperclip className="w-6 h-6 text-slate-300" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    {selectedFile ? selectedFile.name : 'Klik atau seret file ke sini'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleUploadDoc}
                                        disabled={isUploading || !selectedFile || !docName}
                                        className="w-full h-10 rounded-xl font-black uppercase tracking-widest"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mulai Unggah'}
                                    </Button>
                                    <p className="text-[9px] text-center text-slate-400 font-medium">Format: PDF, Word, JPG, PNG (Maks 5MB)</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Document List */}
                        <div className="xl:col-span-2 space-y-4">
                            {data.dokumen.length === 0 ? (
                                <div className="bg-white dark:bg-[#1A2633] rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Belum Ada Dokumen</h3>
                                    <p className="text-xs font-bold text-slate-400 max-w-[200px]">Silakan unggah dokumen pendukung karyawan di panel sebelah kiri.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.dokumen.map((doc) => (
                                        <div key={doc.id} className="bg-white dark:bg-[#1A2633] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    {getFileIcon(doc.file_type)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{doc.nama_dokumen}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {(doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) : '0')} MB • {formatDate(doc.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10"
                                                    onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || ''}/${doc.file_path}`, '_blank')}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDeleteDoc(doc.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modal Cetak */}
            <ModalCetakIDCard
                open={showCetakModal}
                onClose={() => setShowCetakModal(false)}
                karyawanList={[data]}
            />
        </div>
    );
};
