import type { MasterStatus } from '@/types/master';

interface StatusBadgeProps {
    status: MasterStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    return (
        <span className={`
            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
            ${status === 'Aktif'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
        `}>
            {status}
        </span>
    );
};

export default StatusBadge;
