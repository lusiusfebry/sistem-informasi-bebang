import { useState, useRef } from 'react';
import {
    Upload,
    FileSpreadsheet,
    Download,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    ArrowLeft,
    Check
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ModalImportKaryawanProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ImportResult {
    berhasil: number;
    gagal: number;
    errors: { baris: number; pesan: string }[];
}

interface PreviewRow {
    baris: number;
    nama_lengkap: string;
    nomor_induk_karyawan: string;
    divisi: string;
    department: string;
    status_karyawan: string;
    status: 'valid' | 'error';
    pesan: string;
}

interface PreviewData {
    total: number;
    valid: number;
    invalid: number;
    rows: PreviewRow[];
}

export const ModalImportKaryawan = ({ open, onClose, onSuccess }: ModalImportKaryawanProps) => {
    const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx')) {
                toast.error('Hanya file .xlsx yang diperbolehkan');
                return;
            }
            setFile(selectedFile);
            setResult(null);
            setPreviewData(null);
            setStep('upload');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/karyawan/template', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template-import-karyawan.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download template failed', error);
            toast.error('Gagal mengunduh template');
        }
    };

    const handleGetPreview = async () => {
        if (!file) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/karyawan/preview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreviewData(response.data);
            setStep('preview');
        } catch (error) {
            console.error('Preview failed', error);
            toast.error('Gagal memproses pratinjau file');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/karyawan/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            setStep('result');
            if (response.data.berhasil > 0) {
                toast.success(`${response.data.berhasil} data karyawan berhasil diimpor`);
                onSuccess();
            }
            if (response.data.gagal > 0) {
                toast.error(`${response.data.gagal} data gagal diimpor`);
            }
        } catch (error) {
            console.error('Import failed', error);
            toast.error('Terjadi kesalahan saat mengimpor data');
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setStep('upload');
        setFile(null);
        setPreviewData(null);
        setResult(null);
        setShowErrors(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`rounded-3xl p-0 overflow-hidden border-none shadow-2xl transition-all duration-300 ${step === 'preview' ? 'sm:max-w-[1000px]' : 'sm:max-w-[600px]'}`}>
                <DialogHeader className="p-8 bg-slate-900 text-white relative">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <FileSpreadsheet className="w-6 h-6 text-primary" />
                        </div>
                        {step === 'upload' && 'Impor Data Karyawan'}
                        {step === 'preview' && 'Pratinjau Data'}
                        {step === 'result' && 'Hasil Impor'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium font-['Inter']">
                        {step === 'upload' && 'Langkah 1: Pilih file Excel yang ingin diimpor.'}
                        {step === 'preview' && 'Langkah 2: Periksa data sebelum diproses ke database.'}
                        {step === 'result' && 'Langkah 3: Ringkasan hasil pemrosesan data.'}
                    </DialogDescription>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="absolute right-6 top-6 text-slate-400 hover:text-white rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </DialogHeader>

                <div className="p-8 space-y-6 bg-white">
                    {step === 'upload' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-3 rounded-xl">
                                        <Download className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">Belum punya template?</p>
                                        <p className="text-[11px] text-slate-500 font-medium">Gunakan template standar agar data terbaca sempurna.</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    className="rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white"
                                >
                                    Unduh
                                </Button>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group mb-6
                                    ${file ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
                                `}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".xlsx"
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className={`
                                        p-6 rounded-2xl transition-transform duration-300 group-hover:scale-110
                                        ${file ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}
                                    `}>
                                        <Upload className="w-10 h-10" />
                                    </div>
                                    {file ? (
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tight">{file.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tight">Klik atau Taruh File Di Sini</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Hanya format .xlsx</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-slate-200 font-black uppercase tracking-widest text-slate-400"
                                    onClick={handleClose}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={!file || isProcessing}
                                    onClick={handleGetPreview}
                                    className="flex-[2] h-12 rounded-xl bg-primary font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/25 transition-all text-white"
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...</>
                                    ) : (
                                        <span className="flex items-center gap-2">Pratinjau Data <ChevronRight className="w-4 h-4" /></span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && previewData && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="grid grid-cols-3 gap-6 flex-1">
                                    <div className="text-center border-r border-slate-200">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Baris</p>
                                        <p className="text-xl font-black text-slate-900 leading-none">{previewData.total}</p>
                                    </div>
                                    <div className="text-center border-r border-slate-200">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Valid</p>
                                        <p className="text-xl font-black text-emerald-600 leading-none">{previewData.valid}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-1">Error</p>
                                        <p className="text-xl font-black text-rose-600 leading-none">{previewData.invalid}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="max-h-[350px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-slate-900 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">No</th>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</th>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">NIK</th>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Divisi</th>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {previewData.rows.map((row) => (
                                                <tr key={row.baris} className={`hover:bg-slate-50 transition-colors ${row.status === 'error' ? 'bg-rose-50/30' : ''}`}>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-500">{row.baris}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-900">{row.nama_lengkap}</td>
                                                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-600">{row.nomor_induk_karyawan}</td>
                                                    <td className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">{row.divisi || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        {row.status === 'valid' ? (
                                                            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                                                <Check className="w-3 h-3" /> Valid
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1.5 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                                                                    <X className="w-3 h-3" /> Error
                                                                </div>
                                                                <p className="text-[9px] text-rose-400 font-medium mt-0.5 truncate max-w-[150px]" title={row.pesan}>
                                                                    {row.pesan}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-slate-200 font-black uppercase tracking-widest flex items-center gap-2"
                                    onClick={() => setStep('upload')}
                                >
                                    <ArrowLeft className="w-4 h-4" /> Kembali
                                </Button>
                                <Button
                                    disabled={previewData.valid === 0 || isProcessing}
                                    onClick={handleImport}
                                    className="flex-[2] h-12 rounded-xl bg-primary font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/25 transition-all text-white"
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Mengimpor...</>
                                    ) : (
                                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Lanjutkan Import</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'result' && result && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 pb-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-emerald-700 leading-none">{result.berhasil}</p>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Berhasil</p>
                                </div>
                                <div className={`p-6 rounded-3xl border text-center transition-all ${result.gagal > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                    <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${result.gagal > 0 ? 'text-rose-500' : 'text-slate-300'}`} />
                                    <p className={`text-2xl font-black leading-none ${result.gagal > 0 ? 'text-rose-700' : 'text-slate-400'}`}>{result.gagal}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${result.gagal > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Gagal</p>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="border border-slate-100 rounded-3xl overflow-hidden">
                                    <Button
                                        variant="ghost"
                                        className="w-full flex items-center justify-between p-4 h-auto hover:bg-slate-50 rounded-none border-b border-slate-100"
                                        onClick={() => setShowErrors(!showErrors)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Detail Kesalahan ({result.errors.length})</span>
                                        </div>
                                        {showErrors ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </Button>

                                    {showErrors && (
                                        <div className="max-h-[200px] overflow-y-auto bg-slate-50 p-4 space-y-2">
                                            {result.errors.map((err, i) => (
                                                <div key={i} className="flex gap-3 text-[11px] bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-rose-200">
                                                    <Badge variant="outline" className="h-5 px-1.5 rounded-md border-rose-100 text-rose-600 bg-rose-50 font-black text-[9px]">BARIS {err.baris}</Badge>
                                                    <span className="text-slate-600 font-medium py-0.5">{err.pesan}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20"
                            >
                                Selesai
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
