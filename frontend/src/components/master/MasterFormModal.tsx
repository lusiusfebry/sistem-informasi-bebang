import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface MasterFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const MasterFormModal = ({ open, onOpenChange, title, description, children }: MasterFormModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">{title}</DialogTitle>
                        <DialogDescription className="text-primary-foreground/70 font-medium">
                            {description || 'Lengkapi informasi di bawah ini untuk menyimpan data master.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MasterFormModal;
