import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';
import api from '@/lib/api';
import type { StatusKaryawan } from '@/types/master';
import MasterDataTable, { type Column } from '@/components/master/MasterDataTable';
import MasterFormModal from '@/components/master/MasterFormModal';
import StatusBadge from '@/components/master/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
    nama: z.string().min(1, 'Nama status karyawan wajib diisi'),
    keterangan: z.string().optional(),
    status: z.enum(['Aktif', 'Tidak Aktif']),
});

type FormData = z.infer<typeof schema>;

export default function StatusKaryawanPage() {
    const [data, setData] = useState<StatusKaryawan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<StatusKaryawan | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { status: 'Aktif' as const }
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                status: statusFilter === 'Semua' ? '' : statusFilter,
                page: page.toString(),
                limit: '10'
            });
            const response = await api.get(`/master/status-karyawan?${params}`);
            setData(response.data.data);
            setTotalItems(response.data.total);
        } catch {
            toast.error('Gagal mengambil data status karyawan');
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => {
        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const onSubmit = async (values: FormData) => {
        try {
            if (editItem) {
                await api.put(`/master/status-karyawan/${editItem.id}`, values);
                toast.success('Status karyawan berhasil diperbarui');
            } else {
                await api.post('/master/status-karyawan', values);
                toast.success('Status karyawan berhasil ditambah');
            }
            setModalOpen(false);
            fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem');
            } else {
                toast.error('Terjadi kesalahan sistem');
            }
        }
    };

    const handleDelete = async (item: StatusKaryawan) => {
        try {
            await api.delete(`/master/status-karyawan/${item.id}`);
            toast.success('Status karyawan berhasil dihapus');
            fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal menghapus data');
            } else {
                toast.error('Gagal menghapus data');
            }
        }
    };

    const columns: Column<StatusKaryawan>[] = [
        {
            header: 'Status Karyawan',
            render: (it: StatusKaryawan) => (
                <div>
                    <p className="font-bold text-foreground">{it.nama}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{it.code}</p>
                </div>
            )
        },
        { header: 'Keterangan', accessor: 'keterangan' },
        {
            header: 'Status',
            render: (it: StatusKaryawan) => <StatusBadge status={it.status} />
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic">Master <span className="text-primary italic-none">Status Karyawan</span></h1>
                    <p className="text-sm font-medium text-muted-foreground">Kelola status kepegawaian (misal: Percobaan, Tetap).</p>
                </div>
            </div>

            <MasterDataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                search={search}
                onSearchChange={(s) => { setSearch(s); setPage(1); }}
                statusFilter={statusFilter}
                onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
                onAdd={() => {
                    setEditItem(null);
                    reset({ nama: '', keterangan: '', status: 'Aktif' });
                    setModalOpen(true);
                }}
                onEdit={(item) => {
                    setEditItem(item);
                    reset({
                        nama: item.nama,
                        keterangan: item.keterangan || '',
                        status: item.status
                    });
                    setModalOpen(true);
                }}
                onDelete={handleDelete}
                page={page}
                totalItems={totalItems}
                pageSize={10}
                onPageChange={setPage}
                addLabel="Tambah Status"
                deleteTitle="Hapus Status Karyawan"
                deleteDescription="Apakah Anda yakin ingin menghapus status karyawan ini?"
                itemNameAccessor="nama"
            />

            <MasterFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editItem ? 'Edit Status Karyawan' : 'Tambah Status Karyawan'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID Sistem</Label>
                            <Input value={editItem?.id || '-'} readOnly className="h-12 rounded-xl font-bold bg-muted/50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kode Unik</Label>
                            <Input value={editItem?.code || 'Otomatis'} readOnly className="h-12 rounded-xl font-bold bg-muted/50 cursor-not-allowed" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Status</Label>
                        <Input {...register('nama')} placeholder="Contoh: Probation, Permanent, Internship" className="h-12 rounded-xl font-bold" />
                        {errors.nama && <p className="text-xs font-bold text-destructive">{errors.nama.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Keterangan</Label>
                        <Input {...register('keterangan')} placeholder="Opsional" className="h-12 rounded-xl font-bold" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                        <select
                            {...register('status')}
                            className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="Aktif">Aktif</option>
                            <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                        </Button>
                    </div>
                </form>
            </MasterFormModal>
        </div>
    );
}
