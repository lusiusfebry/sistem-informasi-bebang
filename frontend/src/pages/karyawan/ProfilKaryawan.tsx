import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
    GraduationCap,
    UploadCloud,
    Tags,
    PhoneCall,
    Target,
    CheckCircle2,
    Circle,
    PlayCircle,
    Flag,
    Check,
    UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import type { KaryawanDetail } from '@/types/karyawan';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ModalCetakIDCard } from '@/components/ModalCetakIDCard';
import ModernDeleteDialog from '@/components/master/ModernDeleteDialog';

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
    const [isProcessing, setIsProcessing] = useState(false);

    // Delete Modal state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<'employee' | 'document'>('employee');
    const [docToDelete, setDocToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'personal';
    const setActiveTab = (tab: string) => setSearchParams({ tab }, { replace: true });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const dataRef = useRef(data);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const fetchDetail = useCallback(async () => {
        if (!dataRef.current) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const response = await api.get(`/karyawan/${empId}`);
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch employee detail', error);
            toast.error('Gagal mengambil data detail karyawan');
            navigate('/hr/karyawan');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
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

    if (isLoading && !data) {
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

    const getFileIcon = (fileType: string | null | undefined) => {
        const type = fileType?.toLowerCase() || '';
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
        if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <FileText className="w-5 h-5 text-blue-500" />;
        if (type.includes('word') || type.includes('doc')) return <FileText className="w-5 h-5 text-indigo-500" />;
        return <FileText className="w-5 h-5 text-slate-400" />;
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

    const handleDeleteDoc = (docId: number, docName: string) => {
        setDocToDelete({ id: docId, name: docName });
        setDeleteType('document');
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteEmployee = () => {
        setDeleteType('employee');
        setIsDeleteDialogOpen(true);
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteType === 'document' && docToDelete) {
                await api.delete(`/karyawan/dokumen/${docToDelete.id}`);
                toast.success('Dokumen berhasil dihapus');
                fetchDetail();
            } else if (deleteType === 'employee') {
                await api.delete(`/karyawan/${empId}`);
                toast.success('Data karyawan berhasil dihapus');
                navigate('/hr/karyawan');
            }
            setIsDeleteDialogOpen(false);
        } catch (error: unknown) {
            console.error('Delete failed', error);
            let message = deleteType === 'document' ? 'Gagal menghapus dokumen' : 'Gagal menghapus data karyawan';
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                message = error.response.data.message;
            }
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleChecklist = async (checklistId: number) => {
        try {
            await api.put(`/karyawan/onboarding/checklist/${checklistId}/toggle`);
            fetchDetail();
        } catch (error) {
            console.error(error);
            toast.error('Gagal memperbarui checklist');
        }
    };

    const handleInitializeChecklist = async (type: 'onboarding' | 'offboarding') => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/karyawan/${type}/init/${empId}`);
            toast.success(res.data.message);
            fetchDetail();
        } catch (error) {
            console.error(error);
            toast.error('Gagal inisialisasi checklist');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalizeProcess = async (type: 'onboarding' | 'offboarding') => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/karyawan/${type}/finalize/${empId}`);
            toast.success(res.data.message);
            fetchDetail();
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyelesaikan proses');
        } finally {
            setIsProcessing(false);
        }
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
                    {/* Background decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex flex-col xl:flex-row gap-8 relative z-10">
                        {/* Left Section: Avatar & Basic Info */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative group shrink-0">
                                <div className="size-32 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-md ring-4 ring-white dark:ring-slate-800">
                                    {data.foto_karyawan ? (
                                        <img src={data.foto_karyawan} alt={data.nama_lengkap} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-black">
                                            {data.nama_lengkap?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-slate-600 dark:text-slate-300 hover:text-primary transition-all hover:scale-110 border border-slate-100 dark:border-slate-700"
                                    onClick={() => navigate(`/hr/karyawan/${empId}/edit`)}
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 min-w-0 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight uppercase truncate max-w-[400px]">
                                        {data.nama_lengkap}
                                    </h1>
                                    {isRefreshing && <Loader2 className="w-5 h-5 text-primary animate-spin inline-block" />}
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        <CreditCard className="w-4 h-4" />
                                        NIK: {data.nomor_induk_karyawan}
                                    </span>
                                    <Badge
                                        className="px-3 py-1 rounded-full text-xs font-bold border-none"
                                        style={{
                                            backgroundColor: `${data.status_karyawan?.warna}20`,
                                            color: data.status_karyawan?.warna
                                        }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                                        {data.status_karyawan?.nama}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Center Section: Job Details Grid */}
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 px-0 xl:px-8 xl:border-x border-slate-100 dark:border-slate-800/50">
                            {[
                                { label: 'Posisi', value: data.posisi_jabatan?.nama, icon: Briefcase },
                                { label: 'Divisi', value: data.divisi?.nama, icon: Building2 },
                                { label: 'Departemen', value: data.department?.nama, icon: Layers },
                                { label: 'Site', value: data.lokasi_kerja?.nama, icon: MapPin },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/30 transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 text-xs">
                                        <item.icon className="w-3 h-3" />
                                        {item.label}
                                    </span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate" title={String(item.value)}>
                                        {item.value || '-'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Right Section: QR & Quick Actions */}
                        <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-start gap-4 shrink-0">
                            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="size-20" />
                                ) : (
                                    <div className="size-20 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 w-full max-w-[200px] xl:max-w-none">
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-9 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all"
                                        onClick={() => navigate(`/hr/karyawan/${empId}/edit`)}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-9 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                        onClick={() => setShowCetakModal(true)}
                                    >
                                        <Printer className="w-4 h-4 mr-2" />
                                        Cetak
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    {data.status_karyawan?.nama === 'Aktif' && (!data.status_proses || data.status_proses === 'Aktif') && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 h-9 font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition-all"
                                            onClick={() => handleInitializeChecklist('offboarding')}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserMinus className="w-4 h-4 mr-2" />}
                                            Offboard
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-9 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all"
                                        onClick={handleDeleteEmployee}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
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
                        {(data.status_proses === 'Onboarding' || data.status_proses === 'Offboarding' || (data.checklists && data.checklists.length > 0)) && (
                            <TabsTrigger
                                value="checklist"
                                className="pb-3 pt-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent font-semibold text-sm whitespace-nowrap flex items-center gap-2 shadow-none transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Checklist
                                {data.checklists && data.checklists.length > 0 && (
                                    <Badge className="h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white">
                                        {data.checklists.filter(c => !c.is_selesai).length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="personal" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Column 1: Biodata, Identifikasi, & Pernikahan */}
                        <div className="space-y-6 xl:col-span-2">
                            {/* Biodata Karyawan */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Biodata Karyawan</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Lengkap</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.nama_lengkap}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Jenis Kelamin</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.jenis_kelamin || '-'}</p>
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
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Pribadi</label>
                                        <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{data.personal?.email_pribadi || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Identifikasi */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Identifikasi</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Agama</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.agama || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Golongan Darah</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.golongan_darah || '-'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor KTP (NIK)</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.personal?.nomor_ktp || '-'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor Kartu Keluarga</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.personal?.nomor_kartu_keluarga || '-'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor NPWP</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.personal?.nomor_npwp || '-'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor BPJS</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono tracking-wider">{data.personal?.nomor_bpjs || '-'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">NIK di KK</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono tracking-wider">{data.personal?.no_nik_kk || '-'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status Pajak</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 uppercase tracking-wider">{data.personal?.status_pajak || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Pernikahan dan Anak */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status Pernikahan dan Anak</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status Pernikahan</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.status_pernikahan || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Pasangan</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.nama_pasangan || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Menikah</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.personal?.tanggal_menikah)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Cerai</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.personal?.tanggal_cerai)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Wafat Pasangan</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.personal?.tanggal_wafat_pasangan)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pekerjaan Pasangan</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.pekerjaan_pasangan || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Jumlah Anak</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.jumlah_anak || '0'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Alamat & Kontak */}
                        <div className="space-y-6">
                            {/* Alamat Domisili */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Alamat Domisili</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Alamat</label>
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
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Provinsi</label>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.provinsi_domisili || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alamat KTP */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Alamat KTP</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Alamat</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 min-h-[80px]">
                                            {data.personal?.alamat_ktp || '-'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kota</label>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.kota_ktp || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Provinsi</label>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.provinsi_ktp || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Kontak */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Informasi Kontak</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor Handphone 1</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.nomor_handphone || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor Handphone 2</label>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic tracking-wider">{data.personal?.nomor_handphone_2 || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Telp Rumah 1</label>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono tracking-tighter">{data.personal?.nomor_telepon_rumah_1 || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Telp Rumah 2</label>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono tracking-tighter">{data.personal?.nomor_telepon_rumah_2 || '-'}</p>
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
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.personal?.nama_bank || '-'}</p>
                                            <p className="text-[10px] font-bold text-slate-500 italic px-1">Cabang: {data.personal?.cabang_bank || '-'}</p>
                                        </div>
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
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pekerjaan" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Kepegawaian & Penempatan */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kepegawaian & Penempatan</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomor Induk Karyawan (NIK)</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono tracking-wider">{data.nomor_induk_karyawan}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Posisi / Jabatan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.posisi_jabatan?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Divisi</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.divisi?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Departemen</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.department?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Perusahaan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.email_perusahaan || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lokasi Kerja</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.lokasi_kerja?.nama || '-'}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        AL
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Atasan Langsung</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{data.atasan_langsung?.nama_lengkap || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs">
                                        MN
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Manager</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{data.manager?.nama_lengkap || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Kontrak & Hubungan Kerja */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kontrak & Hubungan Kerja</h3>
                                </div>
                                <Badge
                                    className="px-3 py-1 rounded-full text-xs font-semibold border-none"
                                    style={{
                                        backgroundColor: `${data.status_karyawan?.warna}20`,
                                        color: data.status_karyawan?.warna
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                                    {data.status_karyawan?.nama}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Jenis Hubungan Kerja</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.jenis_hubungan_kerja?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Masuk Group</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.hr?.tanggal_masuk_group)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Masuk</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.hr?.tanggal_masuk)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Permanent</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.hr?.tanggal_permanent)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Kontrak</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.hr?.tanggal_kontrak)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Akhir Kontrak</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.hr?.tanggal_akhir_kontrak)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Berhenti</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic text-red-500">{formatDate(data.hr?.tanggal_berhenti)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pangkat & Golongan */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                    <Tags className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pangkat & Golongan</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kategori Pangkat</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.kategori_pangkat?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Golongan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.golongan?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sub Golongan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.sub_golongan?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">No. Dana Pensiun</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono uppercase italic">{data.hr?.no_dana_pensiun || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* POO/POH & Pergerakan */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">POO/POH & Pergerakan</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Point of Origin (POO)</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.point_of_original || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Point of Hire (POH)</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.point_of_hire || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lokasi Sebelumnya</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.lokasi_sebelumnya?.nama || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Mutasi</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.hr?.tanggal_mutasi)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Kontak Darurat */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                                    <PhoneCall className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kontak Darurat</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Kontak 1 */}
                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kontak Darurat #1</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Nama</label>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{data.hr?.emergency_nama_1 || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Hubungan</label>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{data.hr?.emergency_hubungan_1 || '-'}</p>
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Nomor Handphone</label>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{data.hr?.emergency_nomor_1 || '-'}</p>
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Alamat</label>
                                                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{data.hr?.emergency_alamat_1 || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Kontak 2 */}
                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kontak Darurat #2</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Nama</label>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{data.hr?.emergency_nama_2 || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Hubungan</label>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{data.hr?.emergency_hubungan_2 || '-'}</p>
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Nomor Handphone</label>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{data.hr?.emergency_nomor_2 || '-'}</p>
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Alamat</label>
                                                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{data.hr?.emergency_alamat_2 || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pendidikan & Kualifikasi */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pendidikan & Kualifikasi</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tingkat Pendidikan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.tingkat_pendidikan || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Bidang Studi</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.bidang_studi || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Institusi / Sekolah</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.nama_sekolah || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kota Institusi</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.kota_sekolah || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status Kelulusan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.status_kelulusan || '-'}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Keterangan Pendidikan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.keterangan_pendidikan || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Costing & Payroll */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Costing & Payroll</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Siklus Penggajian</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.siklus_pembayaran_gaji || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Costing</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.costing || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assign</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.assign || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actual</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{data.hr?.actual || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ukuran Seragam</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 uppercase">{data.hr?.ukuran_seragam_kerja || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ukuran Sepatu</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 uppercase">{data.hr?.ukuran_sepatu_kerja || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </TabsContent>

                <TabsContent value="keluarga" className="space-y-6 focus-visible:outline-none">
                    <div className="space-y-8">
                        {/* Data Pasangan */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Pasangan (Spouse)</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Lengkap</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700">{data.personal?.nama_pasangan || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pekerjaan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700">{data.personal?.pekerjaan_pasangan || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Lahir</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700 font-mono italic">
                                        {formatDate(data.keluarga?.tanggal_lahir_pasangan)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pendidikan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700">{data.keluarga?.pendidikan_terakhir_pasangan || '-'}</p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tanggal Menikah</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700 font-mono italic">{formatDate(data.personal?.tanggal_menikah)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Keterangan</label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700">{data.keluarga?.keterangan_pasangan || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Data Anak */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Anak (Children)</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.anak?.length === 0 ? (
                                    <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-medium text-slate-400">Belum ada data anak.</p>
                                    </div>
                                ) : (
                                    [...data.anak].sort((a, b) => a.urutan - b.urutan).map((child) => (
                                        <div key={child.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-primary/30 transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-black text-primary border border-slate-100 dark:border-slate-700 shadow-sm">
                                                        0{child.urutan}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{child.nama_anak}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{child.jenis_kelamin}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-900/50">Anak Ke-{child.urutan}</Badge>
                                            </div>
                                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Tgl Lahir</span>
                                                    <span className="text-slate-900 dark:text-white font-bold font-mono">{formatDate(child.tanggal_lahir)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Keterangan</span>
                                                    <span className="text-slate-900 dark:text-white font-bold">{child.keterangan || '-'}</span>
                                                </div>
                                                {child.keterangan && (
                                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                                        <p className="text-[9px] text-slate-400 italic leading-snug">{child.keterangan}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Data Orang Tua & Mertua */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Orang Tua */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Orang Tua Kandung</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-orange-500/30 transition-all">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block italic text-right">Ayah Kandung</label>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex gap-4 mt-2">
                                                <div className="text-[10px]">
                                                    <span className="text-slate-400 font-bold uppercase mr-2">Nama:</span>
                                                    <span className="text-slate-900 dark:text-white font-bold">{data.personal?.nama_ayah || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-pink-500/30 transition-all">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block italic text-right">Ibu Kandung</label>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex gap-4 mt-2">
                                                <div className="text-[10px]">
                                                    <span className="text-slate-400 font-bold uppercase mr-2">Nama:</span>
                                                    <span className="text-slate-900 dark:text-white font-bold">{data.personal?.nama_ibu || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mertua */}
                            <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Orang Tua Mertua</h3>
                                </div>
                                <div className="space-y-4">
                                    {/* Ayah Mertua */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-teal-500/30 transition-all">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block italic text-right border-b border-slate-200 dark:border-slate-700 pb-1">Ayah Mertua</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Nama:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{data.keluarga?.nama_ayah_mertua || '-'}</span>
                                            </div>
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Pekerjaan:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{data.keluarga?.pekerjaan_ayah_mertua || '-'}</span>
                                            </div>
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Tgl Lahir:</span>
                                                <span className="text-slate-900 dark:text-white font-bold font-mono">{formatDate(data.keluarga?.tanggal_lahir_ayah_mertua)}</span>
                                            </div>
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Pendidikan:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{data.keluarga?.pendidikan_terakhir_ayah_mertua || '-'}</span>
                                            </div>
                                            <div className="text-[10px] col-span-full pt-1">
                                                <span className="text-slate-400 font-bold uppercase block mb-0.5">Keterangan:</span>
                                                <p className="text-slate-600 dark:text-slate-300 italic text-[10px]">{data.keluarga?.keterangan_ayah_mertua || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ibu Mertua */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-cyan-500/30 transition-all">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block italic text-right border-b border-slate-200 dark:border-slate-700 pb-1">Ibu Mertua</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Nama:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{data.keluarga?.nama_ibu_mertua || '-'}</span>
                                            </div>
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Pekerjaan:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{data.keluarga?.pekerjaan_ibu_mertua || '-'}</span>
                                            </div>
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Tgl Lahir:</span>
                                                <span className="text-slate-900 dark:text-white font-bold font-mono">{formatDate(data.keluarga?.tanggal_lahir_ibu_mertua)}</span>
                                            </div>
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-slate-400 font-bold uppercase">Pendidikan:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{data.keluarga?.pendidikan_terakhir_ibu_mertua || '-'}</span>
                                            </div>
                                            <div className="text-[10px] col-span-full pt-1">
                                                <span className="text-slate-400 font-bold uppercase block mb-0.5">Keterangan:</span>
                                                <p className="text-slate-600 dark:text-slate-300 italic text-[10px]">{data.keluarga?.keterangan_ibu_mertua || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Saudara Kandung */}
                        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Saudara Kandung</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-none px-2 py-1 rounded text-[10px] font-bold">
                                        Anak Ke-{data.keluarga?.anak_ke || '-'} dari {data.keluarga?.jumlah_saudara_kandung || '0'} Bersaudara
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {data.saudara?.length === 0 ? (
                                    <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-medium text-slate-400">Belum ada data saudara kandung.</p>
                                    </div>
                                ) : (
                                    [...data.saudara].sort((a, b) => a.urutan - b.urutan).map((sibling) => (
                                        <div key={sibling.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Saudara Ke-{sibling.urutan}</p>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{sibling.nama_saudara}</p>
                                                </div>
                                                <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-[10px] font-black text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center border border-purple-200 dark:border-purple-800/50">{sibling.urutan}</span>
                                            </div>
                                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-400 font-bold uppercase">Gen / Lahir</span>
                                                    <span className="text-slate-900 dark:text-white font-bold">{sibling.jenis_kelamin?.charAt(0) || '-'} / {formatDate(sibling.tanggal_lahir).split(',')[0]}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Pekerjaan & Pend:</span>
                                                    <span className="text-[10px] text-slate-900 dark:text-white font-bold truncate">{sibling.pekerjaan || '-'} ({sibling.pendidikan_terakhir || '-'})</span>
                                                </div>
                                                {sibling.keterangan && (
                                                    <p className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-700/10 truncate">{sibling.keterangan}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                                    onClick={() => handleDeleteDoc(doc.id, doc.nama_dokumen)}
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

                <TabsContent value="checklist" className="space-y-6 focus-visible:outline-none">
                    <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${data.status_proses === 'Onboarding' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Checklist {data.status_proses}</h3>
                                    <p className="text-xs text-slate-500">Kelola tugas rutin untuk proses {data.status_proses?.toLowerCase()}</p>
                                </div>
                            </div>
                            {(!data.checklists || data.checklists.length === 0) ? (
                                <Button
                                    onClick={(e) => { e.stopPropagation(); handleInitializeChecklist(data.status_proses === 'Onboarding' ? 'onboarding' : 'offboarding'); }}
                                    disabled={isProcessing}
                                    className="rounded-xl font-bold"
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                                    Mulai Proses
                                </Button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="font-mono font-bold text-primary border-primary/20 bg-primary/5">
                                        {data.checklists.filter(c => c.is_selesai).length} / {data.checklists.length} Selesai
                                    </Badge>
                                    {data.checklists.every(c => c.is_selesai) && (
                                        <Button
                                            onClick={(e) => { e.stopPropagation(); handleFinalizeProcess(data.status_proses === 'Onboarding' ? 'onboarding' : 'offboarding'); }}
                                            disabled={isProcessing}
                                            className={`rounded-xl font-bold ${data.status_proses === 'Onboarding' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Flag className="w-4 h-4 mr-2" />}
                                            Selesaikan {data.status_proses}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-3">
                            {data.checklists?.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleToggleChecklist(item.id)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${item.is_selesai
                                        ? 'bg-slate-50 dark:bg-slate-800/50 border-emerald-100 dark:border-emerald-900/20 opacity-80'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full transition-colors ${item.is_selesai
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                                        }`}>
                                        {item.is_selesai ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold transition-all ${item.is_selesai ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                            {item.template.tugas}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.template.kategori}</p>
                                    </div>
                                    {item.tanggal_selesai && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase">Selesai</p>
                                            <p className="text-[10px] text-slate-400">{format(new Date(item.tanggal_selesai), 'dd MMM yyyy HH:mm', { locale: id })}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <ModernDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={executeDelete}
                isLoading={isDeleting}
                title={deleteType === 'employee' ? 'Hapus Data Karyawan' : 'Hapus Dokumen'}
                description={
                    deleteType === 'employee'
                        ? `Apakah Anda yakin ingin menghapus data karyawan "${data?.nama_lengkap}" secara permanen? Tindakan ini tidak dapat dibatalkan.`
                        : `Apakah Anda yakin ingin menghapus dokumen "${docToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`
                }
                itemName={deleteType === 'employee' ? data?.nama_lengkap : docToDelete?.name}
            />

            {
                data && (
                    <ModalCetakIDCard
                        open={showCetakModal}
                        onClose={() => setShowCetakModal(false)}
                        karyawanList={[data]}
                    />
                )
            }
        </div>
    );
};
