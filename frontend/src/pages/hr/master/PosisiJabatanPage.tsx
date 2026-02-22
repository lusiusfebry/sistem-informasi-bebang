import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';
import api from '@/lib/api';
import type { PosisiJabatan, Department } from '@/types/master';
import MasterDataTable, { type Column } from '@/components/master/MasterDataTable';
import MasterFormModal from '@/components/master/MasterFormModal';
import StatusBadge from '@/components/master/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
    department_id: z.string().min(1, 'Departemen wajib dipilih'),
    nama: z.string().min(1, 'Nama posisi wajib diisi'),
    keterangan: z.string().optional(),
    status: z.enum(['Aktif', 'Tidak Aktif']),
});

type FormData = z.infer<typeof schema>;

export default function PosisiJabatanPage() {
    const [data, setData] = useState<PosisiJabatan[]>([]);
    const [deptOptions, setDeptOptions] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<PosisiJabatan | null>(null);

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
            const response = await api.get(`/master/posisi-jabatan?${params}`);
            setData(response.data.data);
            setTotalItems(response.data.total);
        } catch {
            toast.error('Gagal mengambil data posisi jabatan');
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, page]);

    const fetchDepts = useCallback(async () => {
        try {
            const response = await api.get('/master/department/aktif');
            setDeptOptions(response.data);
        } catch (error) {
            console.error('Fetch departemen aktif error:', error);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    useEffect(() => {
        fetchDepts();
    }, [fetchDepts]);

    const onSubmit = async (values: FormData) => {
        try {
            const payload = { ...values, department_id: parseInt(values.department_id) };
            if (editItem) {
                await api.put(`/master/posisi-jabatan/${editItem.id}`, payload);
                toast.success('Posisi jabatan berhasil diperbarui');
            } else {
                await api.post('/master/posisi-jabatan', payload);
                toast.success('Posisi jabatan berhasil ditambah');
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

    const handleDelete = async (item: PosisiJabatan) => {
        if (!confirm(`Hapus posisi ${item.nama}?`)) return;
        try {
            await api.delete(`/master/posisi-jabatan/${item.id}`);
            toast.success('Posisi jabatan berhasil dihapus');
            fetchData();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400 && error.response?.data?.message?.includes('digunakan')) {
                toast.error('Tidak dapat menghapus: Data ini masih digunakan oleh Karyawan.');
            } else {
                toast.error('Gagal menghapus data');
            }
        }
    };

    const columns: Column<PosisiJabatan>[] = [
        {
            header: 'Posisi Jabatan',
            render: (it: PosisiJabatan) => (
                <div>
                    <p className="font-bold text-foreground">{it.nama}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{it.code}</p>
                </div>
            )
        },
        {
            header: 'Departemen',
            render: (it: PosisiJabatan) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{it.department?.nama}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{it.department?.divisi.nama}</span>
                </div>
            )
        },
        { header: 'Keterangan', accessor: 'keterangan' },
        {
            header: 'Status',
            render: (it: PosisiJabatan) => <StatusBadge status={it.status} />
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic">Master <span className="text-primary italic-none">Posisi Jabatan</span></h1>
                    <p className="text-sm font-medium text-muted-foreground">Kelola peran dan tanggung jawab jabatan di site.</p>
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
                    reset({ department_id: '', nama: '', keterangan: '', status: 'Aktif' });
                    setModalOpen(true);
                }}
                onEdit={(item) => {
                    setEditItem(item);
                    reset({
                        department_id: item.department_id.toString(),
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
                addLabel="Tambah Posisi"
            />

            <MasterFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editItem ? 'Edit Posisi Jabatan' : 'Tambah Posisi Jabatan'}
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
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pilih Departemen</Label>
                        <select
                            {...register('department_id')}
                            className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">-- Pilih Departemen --</option>
                            {deptOptions.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.nama} ({dept.divisi?.nama})</option>
                            ))}
                        </select>
                        {errors.department_id && <p className="text-xs font-bold text-destructive">{errors.department_id.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Posisi</Label>
                        <Input {...register('nama')} placeholder="Contoh: Supervisor, Operator, Staff" className="h-12 rounded-xl font-bold" />
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
