import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    render?: (item: T) => React.ReactNode;
}

interface MasterDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onAdd: () => void;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    page: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    addLabel: string;
}

const MasterDataTable = <T extends { id: string | number }>({
    columns,
    data,
    isLoading,
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onAdd,
    onEdit,
    onDelete,
    page,
    totalItems,
    pageSize,
    onPageChange,
    addLabel
}: MasterDataTableProps<T>) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    return (
        <div className="space-y-6">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-1 items-center gap-3 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari berdasarkan nama atau kode..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 h-11 border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-muted-foreground/10">
                        <Filter className="w-4 h-4 text-muted-foreground ml-2" />
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-widest px-2 py-1.5 focus:outline-none cursor-pointer"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Aktif">Aktif</option>
                            <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>
                    </div>
                </div>
                <Button onClick={onAdd} className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 w-full sm:w-auto">
                    <Plus className="mr-2 w-5 h-5" />
                    {addLabel}
                </Button>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase w-16">No</th>
                                {columns.map((col, idx) => (
                                    <th key={idx} className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                        {col.header}
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase text-right w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>
                                        {columns.map((_, cidx) => (
                                            <td key={cidx} className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        ))}
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Search className="w-12 h-12 mb-4 opacity-10" />
                                            <p className="font-bold uppercase tracking-widest text-xs">Data tidak ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-muted-foreground">
                                            {(page - 1) * pageSize + idx + 1}
                                        </td>
                                        {columns.map((col, cidx) => (
                                            <td key={cidx} className="px-6 py-4 text-sm">
                                                {col.render ? col.render(item) : (col.accessor ? String(item[col.accessor]) : null)}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(item)}
                                                    className="h-9 w-9 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete(item)}
                                                    className="h-9 w-9 rounded-lg hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Menampilkan <span className="text-foreground">{from}</span> hingga <span className="text-foreground">{to}</span> dari <span className="text-foreground">{totalItems}</span> hasil
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1 || isLoading}
                            onClick={() => onPageChange(page - 1)}
                            className="rounded-xl h-9 px-4 font-bold border-slate-200"
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" />
                            Sebelumnya
                        </Button>
                        <div className="flex items-center justify-center h-9 w-12 rounded-xl bg-primary text-primary-foreground text-xs font-black">
                            {page}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages || isLoading}
                            onClick={() => onPageChange(page + 1)}
                            className="rounded-xl h-9 px-4 font-bold border-slate-200"
                        >
                            Berikutnya
                            <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterDataTable;
