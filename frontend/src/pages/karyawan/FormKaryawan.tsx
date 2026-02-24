import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ChevronLeft,
    Save,
    User,
    Briefcase,
    Heart,
    FileText,
    Plus,
    Trash2,
    Loader2,
    Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { karyawanSchema, type KaryawanFormData, type KaryawanAnak, type KaryawanSaudara } from '@/types/karyawan';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MasterItem {
    id: number;
    nama: string;
}

interface MasterData {
    divisi: MasterItem[];
    department: MasterItem[];
    posisi_jabatan: MasterItem[];
    status_karyawan: MasterItem[];
    lokasi_kerja: MasterItem[];
    jenis_hubungan_kerja: MasterItem[];
    kategori_pangkat: MasterItem[];
    golongan: MasterItem[];
    sub_golongan: MasterItem[];
    tag: (MasterItem & { warna: string })[];
    karyawan: { id: number; nama_lengkap: string; nomor_induk_karyawan: string }[];
}

export const FormKaryawan = ({ mode = 'add' }: { mode?: 'add' | 'edit' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(mode === 'edit');
    const [isSaving, setIsSaving] = useState(false);
    const [master, setMaster] = useState<MasterData | null>(null);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);
    const [fileFoto, setFileFoto] = useState<File | null>(null);

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<KaryawanFormData>({
        resolver: zodResolver(karyawanSchema) as unknown as Resolver<KaryawanFormData>,
        defaultValues: {
            head: {
                nama_lengkap: '',
                nomor_induk_karyawan: '',
            },
            personal: {},
            hr: {},
            keluarga: {},
            anak: [],
            saudara: [],
            tag_ids: []
        }
    });

    const { fields: fieldsAnak, append: appendAnak, remove: removeAnak } = useFieldArray({
        control,
        name: "anak"
    });

    const { fields: fieldsSaudara, append: appendSaudara, remove: removeSaudara } = useFieldArray({
        control,
        name: "saudara"
    });

    // Fetch Master Data
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const [div, dpt, pos, stk, lok, jhk, kpk, gol, sgol, tag, kar] = await Promise.all([
                    api.get('/master/divisi/aktif'),
                    api.get('/master/department/aktif'),
                    api.get('/master/posisi-jabatan/aktif'),
                    api.get('/master/status-karyawan/aktif'),
                    api.get('/master/lokasi-kerja/aktif'),
                    api.get('/master/jenis-hubungan-kerja/aktif'),
                    api.get('/master/kategori-pangkat/aktif'),
                    api.get('/master/golongan/aktif'),
                    api.get('/master/sub-golongan/aktif'),
                    api.get('/master/tag/aktif'),
                    api.get('/karyawan?limit=100'),
                ]);

                setMaster({
                    divisi: div.data,
                    department: dpt.data,
                    posisi_jabatan: pos.data,
                    status_karyawan: stk.data,
                    lokasi_kerja: lok.data,
                    jenis_hubungan_kerja: jhk.data,
                    kategori_pangkat: kpk.data,
                    golongan: gol.data,
                    sub_golongan: sgol.data,
                    tag: tag.data,
                    karyawan: kar.data.data
                });
            } catch (error) {
                console.error('Failed to fetch master data', error);
                toast.error('Gagal mengambil data referensi');
            }
        };
        fetchMaster();
    }, []);

    // Fetch Initial Data for Edit
    useEffect(() => {
        if (mode === 'edit' && id) {
            const fetchDetail = async () => {
                try {
                    const response = await api.get(`/karyawan/${id}`);
                    const d = response.data;

                    // Transform for form
                    reset({
                        head: {
                            nama_lengkap: d.nama_lengkap,
                            nomor_induk_karyawan: d.nomor_induk_karyawan,
                            email_perusahaan: d.email_perusahaan,
                            nomor_handphone: d.nomor_handphone,
                            divisi_id: d.divisi_id?.toString(),
                            department_id: d.department_id?.toString(),
                            posisi_jabatan_id: d.posisi_jabatan_id?.toString(),
                            status_karyawan_id: d.status_karyawan_id?.toString(),
                            lokasi_kerja_id: d.lokasi_kerja_id?.toString(),
                            manager_id: d.manager_id?.toString(),
                            atasan_langsung_id: d.atasan_langsung_id?.toString(),
                        },
                        personal: d.personal ? {
                            ...d.personal,
                            nama_pemegang_rekening: d.personal.nama_pemegang_rekening,
                            tanggal_lahir: d.personal.tanggal_lahir ? format(new Date(d.personal.tanggal_lahir), 'yyyy-MM-dd') : '',
                            tanggal_menikah: d.personal.tanggal_menikah ? format(new Date(d.personal.tanggal_menikah), 'yyyy-MM-dd') : '',
                            tanggal_cerai: d.personal.tanggal_cerai ? format(new Date(d.personal.tanggal_cerai), 'yyyy-MM-dd') : '',
                            tanggal_wafat_pasangan: d.personal.tanggal_wafat_pasangan ? format(new Date(d.personal.tanggal_wafat_pasangan), 'yyyy-MM-dd') : '',
                        } : {},
                        hr: d.hr ? {
                            ...d.hr,
                            jenis_hubungan_kerja_id: d.hr.jenis_hubungan_kerja_id?.toString(),
                            kategori_pangkat_id: d.hr.kategori_pangkat_id?.toString(),
                            golongan_id: d.hr.golongan_id?.toString(),
                            sub_golongan_id: d.hr.sub_golongan_id?.toString(),
                            lokasi_sebelumnya_id: d.hr.lokasi_sebelumnya_id?.toString(),
                            tanggal_masuk_group: d.hr.tanggal_masuk_group ? format(new Date(d.hr.tanggal_masuk_group), 'yyyy-MM-dd') : '',
                            tanggal_masuk: d.hr.tanggal_masuk ? format(new Date(d.hr.tanggal_masuk), 'yyyy-MM-dd') : '',
                            tanggal_permanent: d.hr.tanggal_permanent ? format(new Date(d.hr.tanggal_permanent), 'yyyy-MM-dd') : '',
                            tanggal_kontrak: d.hr.tanggal_kontrak ? format(new Date(d.hr.tanggal_kontrak), 'yyyy-MM-dd') : '',
                            tanggal_akhir_kontrak: d.hr.tanggal_akhir_kontrak ? format(new Date(d.hr.tanggal_akhir_kontrak), 'yyyy-MM-dd') : '',
                            tanggal_berhenti: d.hr.tanggal_berhenti ? format(new Date(d.hr.tanggal_berhenti), 'yyyy-MM-dd') : '',
                            tanggal_mutasi: d.hr.tanggal_mutasi ? format(new Date(d.hr.tanggal_mutasi), 'yyyy-MM-dd') : '',
                        } : {},
                        keluarga: d.keluarga ? {
                            ...d.keluarga,
                            tanggal_lahir_pasangan: d.keluarga.tanggal_lahir_pasangan ? format(new Date(d.keluarga.tanggal_lahir_pasangan), 'yyyy-MM-dd') : '',
                            tanggal_lahir_ayah_mertua: d.keluarga.tanggal_lahir_ayah_mertua ? format(new Date(d.keluarga.tanggal_lahir_ayah_mertua), 'yyyy-MM-dd') : '',
                            tanggal_lahir_ibu_mertua: d.keluarga.tanggal_lahir_ibu_mertua ? format(new Date(d.keluarga.tanggal_lahir_ibu_mertua), 'yyyy-MM-dd') : '',
                        } : {},
                        anak: d.anak?.map((a: KaryawanAnak) => ({
                            ...a,
                            tanggal_lahir: a.tanggal_lahir ? format(new Date(a.tanggal_lahir), 'yyyy-MM-dd') : '',
                        })) || [],
                        saudara: d.saudara?.map((s: KaryawanSaudara) => ({
                            ...s,
                            tanggal_lahir: s.tanggal_lahir ? format(new Date(s.tanggal_lahir), 'yyyy-MM-dd') : '',
                        })) || [],
                        tag_ids: d.tags?.map((t: { tag_id: number }) => t.tag_id) || []
                    });

                    if (d.foto_karyawan) {
                        setPreviewFoto(d.foto_karyawan);
                    }
                } catch (error) {
                    console.error('Fetch detail error', error);
                    toast.error('Gagal memuat data karyawan');
                    navigate('/hr/karyawan');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetail();
        }
    }, [mode, id, reset, navigate]);

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewFoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit: SubmitHandler<KaryawanFormData> = async (formData) => {
        setIsSaving(true);
        try {
            // Sanitize data: convert "null" strings back to actual nulls
            // and ensure numeric fields are numbers if they slip through
            const sanitize = (obj: unknown): unknown => {
                if (Array.isArray(obj)) return obj.map(item => sanitize(item));
                if (obj !== null && typeof obj === 'object') {
                    return Object.fromEntries(
                        Object.entries(obj).map(([key, val]) => {
                            if (val === 'null' || val === '') return [key, null];
                            // List of fields that must be numbers
                            const numericFields = [
                                'divisi_id', 'department_id', 'posisi_jabatan_id',
                                'status_karyawan_id', 'lokasi_kerja_id', 'manager_id',
                                'atasan_langsung_id', 'jenis_hubungan_kerja_id',
                                'kategori_pangkat_id', 'golongan_id', 'sub_golongan_id',
                                'lokasi_sebelumnya_id', 'jumlah_anak', 'anak_ke',
                                'jumlah_saudara_kandung'
                            ];
                            if (numericFields.includes(key) && val !== null) {
                                return [key, Number(val)];
                            }
                            return [key, sanitize(val)];
                        })
                    );
                }
                return obj;
            };

            const data = sanitize(formData) as KaryawanFormData;

            let res;
            if (mode === 'add') {
                res = await api.post('/karyawan', data);
                toast.success('Karyawan berhasil ditambahkan');
            } else {
                res = await api.put(`/karyawan/${id}`, data);
                toast.success('Karyawan berhasil diperbarui');
            }

            // Upload foto if any
            if (fileFoto && res.data.id) {
                const formData = new FormData();
                formData.append('foto', fileFoto);
                await api.post(`/karyawan/${res.data.id}/foto`, formData);
            }

            navigate(`/hr/karyawan/${res.data.id || id}`);
        } catch (error: unknown) {
            console.error('Submit error', error);
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal menyimpan data';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 pb-20 max-w-5xl mx-auto">
            {/* Header Sticky */}
            <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 flex items-center justify-between border-b border-slate-200 -mx-4 px-4 sm:-mx-8 sm:px-8">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 p-0 rounded-xl"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight">{mode === 'add' ? 'Tambah Karyawan Baru' : 'Edit Profil Karyawan'}</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modul Manajemen SDM</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="h-11 rounded-xl px-6 font-black uppercase tracking-widest"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-11 rounded-xl px-8 font-black uppercase tracking-widest bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Simpan Data
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="utama" className="w-full space-y-8">
                <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm h-14 w-full justify-start overflow-x-auto overflow-y-hidden no-scrollbar">
                    <TabsTrigger value="utama" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap">
                        <User className="w-4 h-4 mr-2" />
                        Info Utama
                    </TabsTrigger>
                    <TabsTrigger value="pribadi" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap">
                        <FileText className="w-4 h-4 mr-2" />
                        Detail Pribadi
                    </TabsTrigger>
                    <TabsTrigger value="pekerjaan" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Pekerjaan
                    </TabsTrigger>
                    <TabsTrigger value="keluarga" className="rounded-xl px-8 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap">
                        <Heart className="w-4 h-4 mr-2" />
                        Keluarga
                    </TabsTrigger>
                </TabsList>

                {/* Content Utama */}
                <TabsContent value="utama" className="focus-visible:outline-none space-y-6">
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Identitas & Penempatan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Foto Upload */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative group">
                                        <Avatar className="w-40 h-40 border-8 border-white shadow-2xl rounded-[2.5rem]">
                                            <AvatarImage src={previewFoto || ''} className="object-cover" />
                                            <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                                                ?
                                            </AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="upload-foto" className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <Camera className="w-8 h-8 mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Ubah Foto</span>
                                        </label>
                                        <input type="file" id="upload-foto" className="hidden" accept="image/*" onChange={handleFotoChange} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 text-center uppercase leading-tight">Maks 2MB<br />Format: JPG, PNG</p>
                                </div>

                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Lengkap *</Label>
                                        <Input {...register('head.nama_lengkap')} placeholder="Masukkan nama sesuai KTP" className="h-12 rounded-xl" />
                                        {errors.head?.nama_lengkap && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.nama_lengkap.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nomor Induk Karyawan (NIK) *</Label>
                                        <Input {...register('head.nomor_induk_karyawan')} placeholder="Masukkan NIK Perusahaan" className="h-12 rounded-xl" />
                                        {errors.head?.nomor_induk_karyawan && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.nomor_induk_karyawan.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Perusahaan</Label>
                                        <Input {...register('head.email_perusahaan')} placeholder="nama@perusahaan.com" className="h-12 rounded-xl" />
                                        {errors.head?.email_perusahaan && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.email_perusahaan.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nomor Handphone Perusahaan</Label>
                                        <Input {...register('head.nomor_handphone')} placeholder="0812..." className="h-12 rounded-xl" />
                                        {errors.head?.nomor_handphone && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.nomor_handphone.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Divisi *</Label>
                                    <Select value={watch('head.divisi_id')} onValueChange={(v: string) => setValue('head.divisi_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih Divisi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {master?.divisi.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.head?.divisi_id && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.divisi_id.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Departemen *</Label>
                                    <Select value={watch('head.department_id')} onValueChange={(v: string) => setValue('head.department_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih Departemen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {master?.department.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.head?.department_id && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.department_id.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Posisi Jabatan *</Label>
                                    <Select value={watch('head.posisi_jabatan_id')} onValueChange={(v: string) => setValue('head.posisi_jabatan_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih Jabatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {master?.posisi_jabatan.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.head?.posisi_jabatan_id && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.posisi_jabatan_id.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Karyawan *</Label>
                                    <Select value={watch('head.status_karyawan_id')} onValueChange={(v: string) => setValue('head.status_karyawan_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {master?.status_karyawan.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.head?.status_karyawan_id && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.status_karyawan_id.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lokasi Kerja *</Label>
                                    <Select value={watch('head.lokasi_kerja_id')} onValueChange={(v: string) => setValue('head.lokasi_kerja_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih Lokasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {master?.lokasi_kerja.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.head?.lokasi_kerja_id && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.head.lokasi_kerja_id.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manager</Label>
                                    <Select value={watch('head.manager_id') || ''} onValueChange={(v: string) => setValue('head.manager_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih Manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">Tanpa Manager</SelectItem>
                                            {master?.karyawan.filter(k => k.id.toString() !== id).map(it => (
                                                <SelectItem key={it.id} value={it.id.toString()}>{it.nama_lengkap} ({it.nomor_induk_karyawan})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Atasan Langsung</Label>
                                    <Select value={watch('head.atasan_langsung_id') || ''} onValueChange={(v: string) => setValue('head.atasan_langsung_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih Atasan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">Tanpa Atasan</SelectItem>
                                            {master?.karyawan.filter(k => k.id.toString() !== id).map(it => (
                                                <SelectItem key={it.id} value={it.id.toString()}>{it.nama_lengkap} ({it.nomor_induk_karyawan})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-full mt-4 space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tags / Label</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {master?.tag.map(t => {
                                            const isChecked = watch('tag_ids')?.includes(t.id);
                                            return (
                                                <div
                                                    key={t.id}
                                                    onClick={() => {
                                                        const current = watch('tag_ids') || [];
                                                        if (isChecked) {
                                                            setValue('tag_ids', current.filter(id => id !== t.id));
                                                        } else {
                                                            setValue('tag_ids', [...current, t.id]);
                                                        }
                                                    }}
                                                    className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${isChecked
                                                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-primary/30'
                                                        }`}
                                                >
                                                    {t.nama}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Detail Pribadi */}
                <TabsContent value="pribadi" className="focus-visible:outline-none space-y-6">
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Data Biodata & Kontak Pribadi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jenis Kelamin</Label>
                                <Select value={watch('personal.jenis_kelamin') || ''} onValueChange={(v: string) => setValue('personal.jenis_kelamin', v)}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih J.K" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tempat Lahir</Label>
                                <Input {...register('personal.tempat_lahir')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tanggal Lahir</Label>
                                <Input type="date" {...register('personal.tanggal_lahir')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Pribadi</Label>
                                <Input {...register('personal.email_pribadi')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agama</Label>
                                <Input {...register('personal.agama')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Golongan Darah</Label>
                                <Input {...register('personal.golongan_darah')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. Kartu Keluarga</Label>
                                <Input {...register('personal.nomor_kartu_keluarga')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. KTP</Label>
                                <Input {...register('personal.nomor_ktp')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. NPWP</Label>
                                <Input {...register('personal.nomor_npwp')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. BPJS</Label>
                                <Input {...register('personal.nomor_bpjs')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Pernikahan</Label>
                                <Select value={watch('personal.status_pernikahan') || ''} onValueChange={(v: string) => setValue('personal.status_pernikahan', v)}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Married">Married</SelectItem>
                                        <SelectItem value="Widowed">Widowed</SelectItem>
                                        <SelectItem value="Divorced">Divorced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Ayah Kandung</Label>
                                <Input {...register('personal.nama_ayah')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Ibu Kandung</Label>
                                <Input {...register('personal.nama_ibu')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2 col-span-full">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alamat KTP</Label>
                                <Input {...register('personal.alamat_ktp')} className="h-12 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 col-span-full">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kota KTP</Label>
                                    <Input {...register('personal.kota_ktp')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Provinsi KTP</Label>
                                    <Input {...register('personal.provinsi_ktp')} className="h-12 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2 col-span-full">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alamat Domisili</Label>
                                <Input {...register('personal.alamat_domisili')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Bank</Label>
                                <Input {...register('personal.nama_bank')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. Rekening</Label>
                                <Input {...register('personal.nomor_rekening')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Pemegang Rekening</Label>
                                <Input {...register('personal.nama_pemegang_rekening')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cabang Bank</Label>
                                <Input {...register('personal.cabang_bank')} className="h-12 rounded-xl" />
                            </div>

                            {/* Additional Information */}
                            <div className="col-span-full border-t border-slate-100 pt-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. Nik di KK</Label>
                                    <Input {...register('personal.no_nik_kk')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Pajak</Label>
                                    <Input {...register('personal.status_pajak')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. HP 2</Label>
                                    <Input {...register('personal.nomor_handphone_2')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telp Rumah 1</Label>
                                    <Input {...register('personal.nomor_telepon_rumah_1')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telp Rumah 2</Label>
                                    <Input {...register('personal.nomor_telepon_rumah_2')} className="h-12 rounded-xl" />
                                </div>
                            </div>

                            <div className="col-span-full border-t border-slate-100 pt-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Pasangan</Label>
                                    <Input {...register('personal.nama_pasangan')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Menikah</Label>
                                    <Input type="date" {...register('personal.tanggal_menikah')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Cerai</Label>
                                    <Input type="date" {...register('personal.tanggal_cerai')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pasangan Wafat</Label>
                                    <Input type="date" {...register('personal.tanggal_wafat_pasangan')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pekerjaan Pasangan</Label>
                                    <Input {...register('personal.pekerjaan_pasangan')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jumlah Anak</Label>
                                    <Input type="number" {...register('personal.jumlah_anak')} className="h-12 rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Pekerjaan */}
                <TabsContent value="pekerjaan" className="focus-visible:outline-none space-y-6">
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Riwayat & Kontrak Kerja
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Masuk Group</Label>
                                <Input type="date" {...register('hr.tanggal_masuk_group')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Masuk Perusahaan</Label>
                                <Input type="date" {...register('hr.tanggal_masuk')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Selesai Kontrak</Label>
                                <Input type="date" {...register('hr.tanggal_akhir_kontrak')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hubungan Kerja</Label>
                                <Select value={watch('hr.jenis_hubungan_kerja_id') || ''} onValueChange={(v: string) => setValue('hr.jenis_hubungan_kerja_id', v)}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih Hub. Kerja" /></SelectTrigger>
                                    <SelectContent>
                                        {master?.jenis_hubungan_kerja.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Golongan</Label>
                                <Select value={watch('hr.golongan_id') || ''} onValueChange={(v: string) => setValue('hr.golongan_id', v)}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih Golongan" /></SelectTrigger>
                                    <SelectContent>
                                        {master?.golongan.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pangkat</Label>
                                <Select value={watch('hr.kategori_pangkat_id') || ''} onValueChange={(v: string) => setValue('hr.kategori_pangkat_id', v)}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih Pangkat" /></SelectTrigger>
                                    <SelectContent>
                                        {master?.kategori_pangkat.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tingkat Pendidikan</Label>
                                <Input {...register('hr.tingkat_pendidikan')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Sekolah/Univ</Label>
                                <Input {...register('hr.nama_sekolah')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bidang Studi</Label>
                                <Input {...register('hr.bidang_studi')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kota Sekolah</Label>
                                <Input {...register('hr.kota_sekolah')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Kelulusan</Label>
                                <Select value={watch('hr.status_kelulusan') || ''} onValueChange={(v: string) => setValue('hr.status_kelulusan', v)}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lulus">Lulus</SelectItem>
                                        <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
                                        <SelectItem value="Sedang Berjalan">Sedang Berjalan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-full border-t border-slate-100 pt-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Permanent</Label>
                                    <Input type="date" {...register('hr.tanggal_permanent')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Kontrak</Label>
                                    <Input type="date" {...register('hr.tanggal_kontrak')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Berhenti</Label>
                                    <Input type="date" {...register('hr.tanggal_berhenti')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sub Golongan</Label>
                                    <Select value={watch('hr.sub_golongan_id') || ''} onValueChange={(v: string) => setValue('hr.sub_golongan_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih Sub Gol" /></SelectTrigger>
                                        <SelectContent>
                                            {master?.sub_golongan.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">No. Dana Pensiun</Label>
                                    <Input {...register('hr.no_dana_pensiun')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Point of Original</Label>
                                    <Input {...register('hr.point_of_original')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Point of Hire</Label>
                                    <Input {...register('hr.point_of_hire')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ukuran Seragam</Label>
                                    <Input {...register('hr.ukuran_seragam_kerja')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ukuran Sepatu</Label>
                                    <Input {...register('hr.ukuran_sepatu_kerja')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lokasi Sebelumnya</Label>
                                    <Select value={watch('hr.lokasi_sebelumnya_id') || ''} onValueChange={(v: string) => setValue('hr.lokasi_sebelumnya_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih Lokasi" /></SelectTrigger>
                                        <SelectContent>
                                            {master?.lokasi_kerja.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tanggal Mutasi</Label>
                                    <Input type="date" {...register('hr.tanggal_mutasi')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Siklus Gaji</Label>
                                    <Input {...register('hr.siklus_pembayaran_gaji')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Costing</Label>
                                    <Input {...register('hr.costing')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assign</Label>
                                    <Input {...register('hr.assign')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actual</Label>
                                    <Input {...register('hr.actual')} className="h-12 rounded-xl" />
                                </div>
                            </div>

                            <div className="col-span-full border-t border-slate-100 pt-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kontak Darurat 1</Label>
                                    <Input {...register('hr.emergency_nama_1')} placeholder="Nama Lengkap" className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hubungan 1</Label>
                                    <Input {...register('hr.emergency_hubungan_1')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nomor Telp 1</Label>
                                    <Input {...register('hr.emergency_nomor_1')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2 col-span-full">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alamat Emg 1</Label>
                                    <Input {...register('hr.emergency_alamat_1')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kontak Darurat 2</Label>
                                    <Input {...register('hr.emergency_nama_2')} placeholder="Nama Lengkap" className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hubungan 2</Label>
                                    <Input {...register('hr.emergency_hubungan_2')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nomor Telp 2</Label>
                                    <Input {...register('hr.emergency_nomor_2')} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2 col-span-full">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alamat Emg 2</Label>
                                    <Input {...register('hr.emergency_alamat_2')} className="h-12 rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Keluarga */}
                <TabsContent value="keluarga" className="focus-visible:outline-none space-y-6">
                    {/* Section Info Tambahan Keluarga */}
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden mb-8">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                Detail Pasangan & Mertua
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Lahir Pasangan</Label>
                                <Input type="date" {...register('keluarga.tanggal_lahir_pasangan')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pendidikan Pasangan</Label>
                                <Input {...register('keluarga.pendidikan_terakhir_pasangan')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Keterangan Pasangan</Label>
                                <Input {...register('keluarga.keterangan_pasangan')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Anak Ke- (Karyawan)</Label>
                                <Input type="number" {...register('keluarga.anak_ke')} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jml Saudara Kandung</Label>
                                <Input type="number" {...register('keluarga.jumlah_saudara_kandung')} className="h-12 rounded-xl" />
                            </div>

                            <div className="col-span-full border-t border-slate-100 pt-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Informasi Ayah Mertua</h4>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Ayah Mertua</Label>
                                        <Input {...register('keluarga.nama_ayah_mertua')} className="h-11 rounded-xl bg-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Lahir</Label>
                                            <Input type="date" {...register('keluarga.tanggal_lahir_ayah_mertua')} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pendidikan</Label>
                                            <Input {...register('keluarga.pendidikan_terakhir_ayah_mertua')} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pekerjaan</Label>
                                            <Input {...register('keluarga.pekerjaan_ayah_mertua')} className="h-11 rounded-xl bg-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Informasi Ibu Mertua</h4>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Ibu Mertua</Label>
                                        <Input {...register('keluarga.nama_ibu_mertua')} className="h-11 rounded-xl bg-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Lahir</Label>
                                            <Input type="date" {...register('keluarga.tanggal_lahir_ibu_mertua')} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pendidikan</Label>
                                            <Input {...register('keluarga.pendidikan_terakhir_ibu_mertua')} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pekerjaan</Label>
                                            <Input {...register('keluarga.pekerjaan_ibu_mertua')} className="h-11 rounded-xl bg-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section Anak */}
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden mb-8">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                Data Anak
                            </CardTitle>
                            <Button type="button" onClick={() => appendAnak({ nama_anak: '', jenis_kelamin: '', tanggal_lahir: '' })} variant="outline" size="sm" className="h-8 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest">
                                <Plus className="w-3 h-3 mr-1" /> Tambah Anak
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {fieldsAnak.length === 0 ? <p className="text-sm font-bold text-slate-400 italic">Belum ada data anak ditambahkan.</p> : (
                                fieldsAnak.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                        <div className="md:col-span-5 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Anak</Label>
                                            <Input {...register(`anak.${index}.nama_anak`)} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">J.K</Label>
                                            <Select value={watch(`anak.${index}.jenis_kelamin`) || ''} onValueChange={(v: string) => setValue(`anak.${index}.jenis_kelamin`, v)}>
                                                <SelectTrigger className="h-11 rounded-xl bg-white focus:ring-primary"><SelectValue placeholder="Pilih" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Lahir</Label>
                                            <Input type="date" {...register(`anak.${index}.tanggal_lahir`)} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Button type="button" onClick={() => removeAnak(index)} variant="ghost" size="icon" className="h-11 w-11 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Section Saudara */}
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-8 py-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                Data Saudara Kandung
                            </CardTitle>
                            <Button type="button" onClick={() => appendSaudara({ nama_saudara: '', jenis_kelamin: '', tanggal_lahir: '', pendidikan_terakhir: '', pekerjaan: '' })} variant="outline" size="sm" className="h-8 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest">
                                <Plus className="w-3 h-3 mr-1" /> Tambah Saudara
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {fieldsSaudara.length === 0 ? <p className="text-sm font-bold text-slate-400 italic">Belum ada data saudara ditambahkan.</p> : (
                                fieldsSaudara.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="lg:col-span-4 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Saudara</Label>
                                            <Input {...register(`saudara.${index}.nama_saudara`)} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="lg:col-span-2 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">J.K</Label>
                                            <Select value={watch(`saudara.${index}.jenis_kelamin`) || ''} onValueChange={(v: string) => setValue(`saudara.${index}.jenis_kelamin`, v)}>
                                                <SelectTrigger className="h-11 rounded-xl bg-white"><SelectValue placeholder="Pilih" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="lg:col-span-3 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pendidikan</Label>
                                            <Input {...register(`saudara.${index}.pendidikan_terakhir`)} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="lg:col-span-2 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pekerjaan</Label>
                                            <Input {...register(`saudara.${index}.pekerjaan`)} className="h-11 rounded-xl bg-white" />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <Button type="button" onClick={() => removeSaudara(index)} variant="ghost" size="icon" className="h-11 w-11 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >
        </form >
    );
};
