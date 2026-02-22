import { Construction } from 'lucide-react';

const ComingSoon = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Construction className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Halaman Sedang Dikembangkan</h2>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Fitur ini akan segera hadir untuk melengkapi ekosistem layanan Bebang Sistem Informasi.
            </p>
        </div>
    );
};

export default ComingSoon;
