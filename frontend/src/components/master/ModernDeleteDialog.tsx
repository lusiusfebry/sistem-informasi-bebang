import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ModernDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
    isLoading?: boolean;
}

const ModernDeleteDialog: React.FC<ModernDeleteDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    title = "Konfirmasi Hapus",
    description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
    itemName,
    isLoading = false
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-rose-500 h-2 w-full" />
                <div className="p-6">
                    <DialogHeader className="flex flex-col items-center text-center space-y-4">
                        <div className="size-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-500 animate-pulse">
                            <AlertTriangle className="size-8" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                {description}
                                {itemName && (
                                    <span className="block mt-2 font-bold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded italic shrink-0">
                                        "{itemName}"
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            disabled={isLoading}
                        >
                            Batalkan
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="size-4 mr-2" />
                                    Hapus Data
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModernDeleteDialog;
