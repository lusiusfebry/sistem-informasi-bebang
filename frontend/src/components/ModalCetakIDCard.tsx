import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Printer, X, Loader2, LayoutGrid } from 'lucide-react';
import { IDCard } from './IDCard';
import type { KaryawanListItem } from '@/types/karyawan';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ModalCetakIDCardProps {
    open: boolean;
    onClose: () => void;
    karyawanList: KaryawanListItem[];
}

type LayoutType = 'single' | 'a4-2x2' | 'a4-1x1' | 'a3-3x2';

export const ModalCetakIDCard = ({ open, onClose, karyawanList }: ModalCetakIDCardProps) => {
    const [layout, setLayout] = useState<LayoutType>('single');
    const [orientasi, setOrientasi] = useState<'portrait' | 'landscape'>('portrait');
    const [marginMm, setMarginMm] = useState(10);
    const [qrMap, setQrMap] = useState<Record<number, string>>({});
    const [loadingQr, setLoadingQr] = useState(false);

    useEffect(() => {
        const fetchQRCodes = async () => {
            setLoadingQr(true);
            const newQrMap: Record<number, string> = {};

            try {
                await Promise.all(karyawanList.map(async (k) => {
                    const response = await api.get(`/karyawan/${k.id}/qrcode`, { responseType: 'blob' });
                    const reader = new FileReader();
                    return new Promise((resolve) => {
                        reader.onloadend = () => {
                            newQrMap[k.id] = reader.result as string;
                            resolve(null);
                        };
                        reader.readAsDataURL(response.data);
                    });
                }));
                setQrMap(newQrMap);
            } catch (error) {
                console.error('Failed to fetch QR codes', error);
                toast.error('Gagal mengambil data QR Code');
            } finally {
                setLoadingQr(false);
            }
        };

        if (open && karyawanList.length > 0) {
            fetchQRCodes();
        }
    }, [open, karyawanList]);

    const handleCetak = () => {
        const paperSize = layout.startsWith('a3') ? 'A3' : 'A4';

        // Buat style dinamis untuk print
        const styleId = 'print-style';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        style.innerHTML = `
            @media print {
                @page { 
                    size: ${paperSize} ${orientasi}; 
                    margin: ${marginMm}mm; 
                }
                body > *:not(#print-area) { 
                    display: none !important; 
                }
                #print-area { 
                    display: block !important; 
                    width: 100% !important;
                }
                .id-card-item {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                .grid-container {
                    display: grid;
                    gap: 5mm;
                    ${layout === 'a4-2x2' ? 'grid-template-columns: repeat(2, 1fr);' : ''}
                    ${layout === 'a3-3x2' ? 'grid-template-columns: repeat(3, 1fr);' : ''}
                }
            }
        `;

        // Siapkan area print
        const printAreaId = 'print-area';
        let printArea = document.getElementById(printAreaId);
        if (!printArea) {
            printArea = document.createElement('div');
            printArea.id = printAreaId;
            printArea.style.display = 'none';
            document.body.appendChild(printArea);
        }

        // Render cards ke dalam print area
        const gridClass = layout === 'single' ? '' : 'grid-container';
        printArea.className = gridClass;

        // Simpan konten asli untuk cleanup nanti jika perlu, tapi kita cuma pakai display none di @media print
        // Untuk React, kita bisa pakai portal atau cuma render di elemen statis
        // Karena ini perintah verbatim, saya akan render via innerHTML atau pakai render portal jika memungkinkan.
        // Tapi cara paling 'React' adalah punya elemen permanen di App.tsx. 
        // Namun demi kemudahan, saya akan isi innerHTML-nya dengan clone dari preview.

        const previewEl = document.getElementById('id-card-preview-container');
        if (previewEl) {
            printArea.innerHTML = previewEl.innerHTML;
            window.print();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-slate-50 border-b">
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Printer className="w-6 h-6 text-primary" />
                            CETAK ID CARD
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Settings Sidebar */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Pengaturan Kertas</h3>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Layout Halaman</Label>
                                <Select value={layout} onValueChange={(v: LayoutType) => setLayout(v)}>
                                    <SelectTrigger className="h-11 rounded-xl font-bold bg-white border-slate-200">
                                        <SelectValue placeholder="Pilih Layout" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single" className="font-bold">Satu per Halaman</SelectItem>
                                        <SelectItem value="a4-2x2" className="font-bold">Grid A4 (2x2)</SelectItem>
                                        <SelectItem value="a4-1x1" className="font-bold">Fokus A4 (Tengah)</SelectItem>
                                        <SelectItem value="a3-3x2" className="font-bold">Grid A3 (3x2)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Orientasi</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={orientasi === 'portrait' ? 'default' : 'outline'}
                                        onClick={() => setOrientasi('portrait')}
                                        className="rounded-xl h-11 font-bold"
                                    >
                                        Portrait
                                    </Button>
                                    <Button
                                        variant={orientasi === 'landscape' ? 'default' : 'outline'}
                                        onClick={() => setOrientasi('landscape')}
                                        className="rounded-xl h-11 font-bold"
                                    >
                                        Landscape
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Margin (mm)</Label>
                                <Input
                                    type="number"
                                    value={marginMm}
                                    onChange={(e) => setMarginMm(Number(e.target.value))}
                                    className="h-11 rounded-xl font-bold bg-white border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-[10px] text-primary font-bold leading-relaxed italic">
                                * Pastikan pengaturan printer di browser memiliki "Background Graphics" diaktifkan agar desain tampil sempurna saat dicetak.
                            </p>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="md:col-span-2 bg-slate-100 rounded-3xl p-8 border-2 border-dashed border-slate-200 min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4" />
                                PREVIEW CETAK
                            </h3>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 uppercase">
                                {karyawanList.length} Kartu dipilih
                            </span>
                        </div>

                        {loadingQr ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-xs font-bold text-slate-500 animate-pulse uppercase tracking-widest">Menyiapkan QR Codes...</p>
                            </div>
                        ) : (
                            <div
                                id="id-card-preview-container"
                                className={`flex-1 overflow-auto flex flex-wrap gap-4 p-4 items-center justify-center content-start ${layout === 'single' ? 'flex-col' : ''}`}
                            >
                                {karyawanList.map((k) => (
                                    <IDCard
                                        key={k.id}
                                        karyawan={k}
                                        qrCodeDataUrl={qrMap[k.id] || ''}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 bg-white border-t gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest">
                        Batal
                    </Button>
                    <Button
                        disabled={loadingQr || Object.keys(qrMap).length === 0}
                        onClick={handleCetak}
                        className="rounded-xl h-12 px-8 font-black uppercase tracking-widest bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Cetak Sekarang
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
