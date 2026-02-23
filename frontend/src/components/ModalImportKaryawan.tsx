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
    ChevronUp
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

export const ModalImportKaryawan = ({ open, onClose, onSuccess }: ModalImportKaryawanProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
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
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/karyawan/export?limit=0', {
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

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/karyawan/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            if (response.data.berhasil > 0) {
                toast.success(`${response.data.berhasil} data karyawan berhasil diimpor`);
                onSuccess();
            }
            if (response.data.gagal > 0) {
                toast.error(`${response.data.gagal} data gagal diimpor`);
            }
        } catch (error) {
            console.error('Import failed', error);
            toast.error('Terjadi kesalahan saat mengunggah file');
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
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
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-slate-900 text-white relative">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <FileSpreadsheet className="w-6 h-6 text-primary" />
                        </div>
                        Impor Data Karyawan
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium font-['Inter']">
                        Unggah file Excel untuk menambah atau memperbarui data karyawan secara massal.
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
                    {!result ? (
                        <>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
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
                                    border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group
                                    ${file ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
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
                                    className="flex-1 h-12 rounded-xl border-slate-200 font-black uppercase tracking-widest"
                                    onClick={handleClose}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={!file || isUploading}
                                    onClick={handleUpload}
                                    className="flex-2 h-12 rounded-xl bg-primary font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/25 transition-all"
                                >
                                    {isUploading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...</>
                                    ) : (
                                        'Mulai Import'
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
                                        className="w-full flex items-center justify-between p-4 h-auto hover:bg-slate-50 rounded-none"
                                        onClick={() => setShowErrors(!showErrors)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Lihat Detail Galat ({result.errors.length})</span>
                                        </div>
                                        {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>

                                    {showErrors && (
                                        <div className="max-h-[200px] overflow-y-auto bg-slate-50 p-4 space-y-2">
                                            {result.errors.map((err, i) => (
                                                <div key={i} className="flex gap-3 text-[11px] bg-white p-3 rounded-xl border border-slate-100">
                                                    <span className="font-black text-rose-500">Baris {err.baris}</span>
                                                    <span className="text-slate-600 font-medium italic">{err.pesan}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
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
