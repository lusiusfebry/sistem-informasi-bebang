import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';
import api from '@/lib/api';
import type { LokasiKerja } from '@/types/master';
import MasterDataTable, { type Column } from '@/components/master/MasterDataTable';
import MasterFormModal from '@/components/master/MasterFormModal';
import StatusBadge from '@/components/master/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
    nama: z.string().min(1, 'Nama lokasi kerja wajib diisi'),
    alamat: z.string().optional(),
    keterangan: z.string().optional(),
    status: z.enum(['Aktif', 'Tidak Aktif']),
});

type FormData = z.infer<typeof schema>;

export default function LokasiKerjaPage() {
    const [data, setData] = useState<LokasiKerja[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<LokasiKerja | null>(null);

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
            const response = await api.get(`/master/lokasi-kerja?${params}`);
            setData(response.data.data);
            setTotalItems(response.data.total);
        } catch {
            toast.error('Gagal mengambil data lokasi kerja');
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
                await api.put(`/master/lokasi-kerja/${editItem.id}`, values);
                toast.success('Lokasi kerja berhasil diperbarui');
            } else {
                await api.post('/master/lokasi-kerja', values);
                toast.success('Lokasi kerja berhasil ditambah');
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

    const handleDelete = async (item: LokasiKerja) => {
        if (!confirm(`Hapus lokasi ${item.nama}?`)) return;
        try {
            await api.delete(`/master/lokasi-kerja/${item.id}`);
            toast.success('Lokasi kerja berhasil dihapus');
            fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal menghapus data');
            } else {
                toast.error('Gagal menghapus data');
            }
        }
    };

    const columns: Column<LokasiKerja>[] = [
        {
            header: 'Lokasi Kerja',
            render: (it: LokasiKerja) => (
                <div>
                    <p className="font-bold text-foreground">{it.nama}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{it.code}</p>
                </div>
            )
        },
        { header: 'Alamat', accessor: 'alamat' },
        {
            header: 'Status',
            render: (it: LokasiKerja) => <StatusBadge status={it.status} />
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic">Master <span className="text-primary italic-none">Lokasi Kerja</span></h1>
                    <p className="text-sm font-medium text-muted-foreground">Kelola titik lokasi penempatan kerja karyawan.</p>
                </div>
            </div>

            <MasterDataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onAdd={() => {
                    setEditItem(null);
                    reset({ nama: '', alamat: '', keterangan: '', status: 'Aktif' });
                    setModalOpen(true);
                }}
                onEdit={(item) => {
                    setEditItem(item);
                    reset({
                        nama: item.nama,
                        alamat: item.alamat || '',
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
                addLabel="Tambah Lokasi"
            />

            <MasterFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editItem ? 'Edit Lokasi Kerja' : 'Tambah Lokasi Kerja'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Lokasi</Label>
                        <Input {...register('nama')} placeholder="Contoh: Site Taliabu, Head Office" className="h-12 rounded-xl font-bold" />
                        {errors.nama && <p className="text-xs font-bold text-destructive">{errors.nama.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alamat</Label>
                        <textarea
                            {...register('alamat')}
                            placeholder="Alamat lengkap lokasi..."
                            className="w-full h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
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
