import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { KaryawanListItem } from '@/types/karyawan';

interface IDCardProps {
    karyawan: KaryawanListItem;
    qrCodeDataUrl: string;
}

export const IDCard = ({ karyawan, qrCodeDataUrl }: IDCardProps) => {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(today.getFullYear() + 1);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div
            className="id-card-item relative bg-white border border-slate-200 overflow-hidden shadow-sm print:shadow-none print:border-slate-300"
            style={{
                width: '85.6mm',
                height: '54mm',
                minWidth: '85.6mm',
                minHeight: '54mm',
                padding: '4mm'
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1">
                    <div className="bg-primary w-6 h-6 rounded flex items-center justify-center">
                        <span className="text-white font-black text-[10px]">B</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black tracking-tighter uppercase italic leading-none">BEBANG</p>
                        <p className="text-[6px] font-bold text-muted-foreground uppercase tracking-widest leading-none">SDM</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[6px] font-black text-primary uppercase tracking-widest italic">Official ID Card</p>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex gap-4">
                {/* Left: Photo */}
                <div className="w-[20mm] h-[25mm] shrink-0 border border-slate-100 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                    <Avatar className="w-full h-full rounded-none">
                        <AvatarImage
                            src={karyawan.foto_karyawan || ''}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-lg font-black bg-primary/10 text-primary">
                            {karyawan.nama_lengkap.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Right: Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        <h2 className="text-xs font-black text-slate-900 uppercase leading-snug line-clamp-1">
                            {karyawan.nama_lengkap}
                        </h2>
                        <p className="text-[8px] font-mono font-bold text-slate-500 mb-2">
                            NIK: {karyawan.nomor_induk_karyawan}
                        </p>

                        <div className="space-y-0.5">
                            <div>
                                <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground leading-none">Jabatan</p>
                                <p className="text-[8px] font-bold text-slate-700 leading-tight">{karyawan.posisi_jabatan.nama}</p>
                            </div>
                            <div>
                                <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground leading-none">Divisi / Dept</p>
                                <p className="text-[8px] font-bold text-slate-700 leading-tight">
                                    {karyawan.divisi.nama} / {karyawan.department.nama}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <div>
                                <p className="text-[5px] font-black uppercase tracking-widest text-muted-foreground leading-none">Berlaku s/d</p>
                                <p className="text-[7px] font-bold text-slate-900">{formatDate(expiryDate)}</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="w-10 h-10 shrink-0 border border-slate-100 p-0.5 rounded bg-white">
                            <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Design Accents */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8" />
            <div className="absolute bottom-0 left-0 w-24 h-1 bg-primary" />
        </div>
    );
};
