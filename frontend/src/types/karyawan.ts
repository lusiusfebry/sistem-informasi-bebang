import { z } from 'zod';
const zNumeric = z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((v): number | null => (v === "" || v === undefined || v === null ? null : Number(v)));

export interface KaryawanListItem {
    id: number;
    nama_lengkap: string;
    nomor_induk_karyawan: string;
    foto_karyawan: string | null;
    posisi_jabatan: {
        nama: string;
    };
    divisi: {
        nama: string;
    };
    department: {
        nama: string;
    };
    status_karyawan: {
        nama: string;
        warna: string;
    };
    lokasi_kerja: {
        nama: string;
    };
    tags: Array<{
        tag: {
            nama: string;
            warna: string;
        };
    }>;
}

export interface KaryawanPersonal {
    jenis_kelamin: string | null;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    email_pribadi: string | null;
    agama: string | null;
    golongan_darah: string | null;
    nomor_kartu_keluarga: string | null;
    nomor_ktp: string | null;
    nomor_npwp: string | null;
    nomor_bpjs: string | null;
    no_nik_kk: string | null;
    status_pajak: string | null;
    alamat_domisili: string | null;
    kota_domisili: string | null;
    provinsi_domisili: string | null;
    alamat_ktp: string | null;
    kota_ktp: string | null;
    provinsi_ktp: string | null;
    nomor_handphone_2: string | null;
    nomor_telepon_rumah_1: string | null;
    nomor_telepon_rumah_2: string | null;
    status_pernikahan: string | null;
    nama_pasangan: string | null;
    tanggal_menikah: string | null;
    pekerjaan_pasangan: string | null;
    jumlah_anak?: number | null;
    nomor_rekening: string | null;
    nama_pemegang_rekening: string | null;
    nama_bank: string | null;
    cabang_bank: string | null;
    nama_ayah: string | null;
    nama_ibu: string | null;
}

export interface KaryawanHR {
    tanggal_masuk_group: string | null;
    tanggal_masuk: string | null;
    tanggal_permanent: string | null;
    tanggal_kontrak: string | null;
    tanggal_akhir_kontrak: string | null;
    tanggal_berhenti: string | null;
    tingkat_pendidikan: string | null;
    bidang_studi: string | null;
    nama_sekolah: string | null;
    kota_sekolah: string | null;
    status_kelulusan: string | null;
    emergency_nama_1: string | null;
    emergency_nomor_1: string | null;
    emergency_hubungan_1: string | null;
    emergency_alamat_1: string | null;
    emergency_nama_2: string | null;
    emergency_nomor_2: string | null;
    emergency_hubungan_2: string | null;
    emergency_alamat_2: string | null;
    point_of_original: string | null;
    point_of_hire: string | null;
    ukuran_seragam_kerja: string | null;
    ukuran_sepatu_kerja: string | null;
    siklus_pembayaran_gaji: string | null;
    jenis_hubungan_kerja: { nama: string } | null;
    kategori_pangkat: { nama: string } | null;
    golongan: { nama: string } | null;
    sub_golongan: { nama: string } | null;
    lokasi_sebelumnya: { nama: string } | null;
}

export interface KaryawanAnak {
    id: number;
    urutan: number;
    nama_anak: string | null;
    jenis_kelamin: string | null;
    tanggal_lahir: string | null;
    keterangan: string | null;
}

export interface KaryawanSaudara {
    id: number;
    urutan: number;
    nama_saudara: string | null;
    jenis_kelamin: string | null;
    tanggal_lahir: string | null;
    pendidikan_terakhir: string | null;
    pekerjaan: string | null;
    keterangan: string | null;
}

export interface KaryawanKeluarga {
    id: number;
    karyawan_id: number;
    tanggal_lahir_pasangan: string | null;
    pendidikan_terakhir_pasangan: string | null;
    pekerjaan_pasangan: string | null;
    keterangan_pasangan: string | null;
    anak_ke?: number | null;
    jumlah_saudara_kandung?: number | null;
    nama_ayah_mertua: string | null;
    tanggal_lahir_ayah_mertua: string | null;
    pendidikan_terakhir_ayah_mertua: string | null;
    pekerjaan_ayah_mertua: string | null;
    keterangan_ayah_mertua: string | null;
    nama_ibu_mertua: string | null;
    tanggal_lahir_ibu_mertua: string | null;
    pendidikan_terakhir_ibu_mertua: string | null;
    pekerjaan_ibu_mertua: string | null;
    keterangan_ibu_mertua: string | null;
}

export interface KaryawanDokumen {
    id: number;
    nama_dokumen: string;
    file_path: string;
    file_type: string | null;
    file_size: number | null;
    created_at: string;
}

export interface KaryawanDetail extends KaryawanListItem {
    email_perusahaan: string | null;
    nomor_handphone: string | null;
    manager: { nama_lengkap: string; nomor_induk_karyawan: string } | null;
    atasan_langsung: { nama_lengkap: string; nomor_induk_karyawan: string } | null;
    personal: KaryawanPersonal | null;
    hr: KaryawanHR | null;
    anak: KaryawanAnak[];
    saudara: KaryawanSaudara[];
    dokumen: KaryawanDokumen[];
    keluarga: KaryawanKeluarga | null;
    mess_room?: {
        nomor_kamar: string;
        mess: {
            nama: string;
        };
    } | null;
}

export interface KaryawanListResponse {
    data: KaryawanListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface FilterKaryawan {
    search: string;
    divisi_id: string;
    department_id: string;
    status_karyawan_id: string;
    lokasi_kerja_id: string;
    page: number;
    limit: number;
}

// Zod Schemas for Validation
export const karyawanHeadSchema = z.object({
    nama_lengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
    nomor_induk_karyawan: z.string().min(5, 'NIK minimal 5 karakter'),
    email_perusahaan: z.string().email('Format email tidak valid').optional().nullable(),
    nomor_handphone: z.string().min(10, 'Nomor HP minimal 10 digit').optional().nullable(),
    divisi_id: z.string().min(1, 'Divisi wajib dipilih'),
    department_id: z.string().min(1, 'Departemen wajib dipilih'),
    posisi_jabatan_id: z.string().min(1, 'Jabatan wajib dipilih'),
    status_karyawan_id: z.string().min(1, 'Status wajib dipilih'),
    lokasi_kerja_id: z.string().min(1, 'Lokasi kerja wajib dipilih'),
    manager_id: z.string().optional().nullable(),
    atasan_langsung_id: z.string().optional().nullable(),
});

export const karyawanPersonalSchema = z.object({
    jenis_kelamin: z.string().optional().nullable(),
    tempat_lahir: z.string().optional().nullable(),
    tanggal_lahir: z.string().optional().nullable(),
    email_pribadi: z.string().email('Format email tidak valid').or(z.literal('')).optional().nullable(),
    agama: z.string().optional().nullable(),
    golongan_darah: z.string().optional().nullable(),
    nomor_kartu_keluarga: z.string().optional().nullable(),
    nomor_ktp: z.string().optional().nullable(),
    nomor_npwp: z.string().optional().nullable(),
    nomor_bpjs: z.string().optional().nullable(),
    no_nik_kk: z.string().optional().nullable(),
    status_pajak: z.string().optional().nullable(),
    alamat_domisili: z.string().optional().nullable(),
    kota_domisili: z.string().optional().nullable(),
    provinsi_domisili: z.string().optional().nullable(),
    alamat_ktp: z.string().optional().nullable(),
    kota_ktp: z.string().optional().nullable(),
    provinsi_ktp: z.string().optional().nullable(),
    nomor_handphone_2: z.string().optional().nullable(),
    nomor_telepon_rumah_1: z.string().optional().nullable(),
    nomor_telepon_rumah_2: z.string().optional().nullable(),
    status_pernikahan: z.string().optional().nullable(),
    nama_pasangan: z.string().optional().nullable(),
    tanggal_menikah: z.string().optional().nullable(),
    tanggal_cerai: z.string().optional().nullable(),
    tanggal_wafat_pasangan: z.string().optional().nullable(),
    pekerjaan_pasangan: z.string().optional().nullable(),
    jumlah_anak: zNumeric,
    nomor_rekening: z.string().optional().nullable(),
    nama_pemegang_rekening: z.string().optional().nullable(),
    nama_bank: z.string().optional().nullable(),
    cabang_bank: z.string().optional().nullable(),
    nama_ayah: z.string().optional().nullable(),
    nama_ibu: z.string().optional().nullable(),
});

export const karyawanHRSchema = z.object({
    tanggal_masuk_group: z.string().optional().nullable(),
    tanggal_masuk: z.string().optional().nullable(),
    tanggal_permanent: z.string().optional().nullable(),
    tanggal_kontrak: z.string().optional().nullable(),
    tanggal_akhir_kontrak: z.string().optional().nullable(),
    tanggal_berhenti: z.string().optional().nullable(),
    jenis_hubungan_kerja_id: z.string().optional().nullable(),
    kategori_pangkat_id: z.string().optional().nullable(),
    golongan_id: z.string().optional().nullable(),
    sub_golongan_id: z.string().optional().nullable(),
    tingkat_pendidikan: z.string().optional().nullable(),
    nama_sekolah: z.string().optional().nullable(),
    bidang_studi: z.string().optional().nullable(),
    kota_sekolah: z.string().optional().nullable(),
    status_kelulusan: z.string().optional().nullable(),
    keterangan_pendidikan: z.string().optional().nullable(),
    no_dana_pensiun: z.string().optional().nullable(),
    emergency_nama_1: z.string().optional().nullable(),
    emergency_nomor_1: z.string().optional().nullable(),
    emergency_hubungan_1: z.string().optional().nullable(),
    emergency_alamat_1: z.string().optional().nullable(),
    emergency_nama_2: z.string().optional().nullable(),
    emergency_nomor_2: z.string().optional().nullable(),
    emergency_hubungan_2: z.string().optional().nullable(),
    emergency_alamat_2: z.string().optional().nullable(),
    point_of_original: z.string().optional().nullable(),
    point_of_hire: z.string().optional().nullable(),
    ukuran_seragam_kerja: z.string().optional().nullable(),
    ukuran_sepatu_kerja: z.string().optional().nullable(),
    lokasi_sebelumnya_id: z.string().optional().nullable(),
    tanggal_mutasi: z.string().optional().nullable(),
    siklus_pembayaran_gaji: z.string().optional().nullable(),
    costing: z.string().optional().nullable(),
    assign: z.string().optional().nullable(),
    actual: z.string().optional().nullable(),
});

export const karyawanKeluargaSchema = z.object({
    tanggal_lahir_pasangan: z.string().optional().nullable(),
    pendidikan_terakhir_pasangan: z.string().optional().nullable(),
    pekerjaan_pasangan: z.string().optional().nullable(),
    keterangan_pasangan: z.string().optional().nullable(),
    anak_ke: zNumeric,
    jumlah_saudara_kandung: zNumeric,
    nama_ayah_mertua: z.string().optional().nullable(),
    tanggal_lahir_ayah_mertua: z.string().optional().nullable(),
    pendidikan_terakhir_ayah_mertua: z.string().optional().nullable(),
    pekerjaan_ayah_mertua: z.string().optional().nullable(),
    keterangan_ayah_mertua: z.string().optional().nullable(),
    nama_ibu_mertua: z.string().optional().nullable(),
    tanggal_lahir_ibu_mertua: z.string().optional().nullable(),
    pendidikan_terakhir_ibu_mertua: z.string().optional().nullable(),
    pekerjaan_ibu_mertua: z.string().optional().nullable(),
    keterangan_ibu_mertua: z.string().optional().nullable(),
});

export const karyawanAnakSchema = z.object({
    nama_anak: z.string().min(1, 'Nama anak wajib diisi'),
    jenis_kelamin: z.string().optional().nullable(),
    tanggal_lahir: z.string().optional().nullable(),
});

export const karyawanSaudaraSchema = z.object({
    nama_saudara: z.string().min(1, 'Nama saudara wajib diisi'),
    jenis_kelamin: z.string().optional().nullable(),
    tanggal_lahir: z.string().optional().nullable(),
    pendidikan_terakhir: z.string().optional().nullable(),
    pekerjaan: z.string().optional().nullable(),
});

export const karyawanSchema = z.object({
    head: karyawanHeadSchema,
    personal: karyawanPersonalSchema.optional(),
    hr: karyawanHRSchema.optional(),
    keluarga: karyawanKeluargaSchema.optional(),
    anak: z.array(karyawanAnakSchema).optional(),
    saudara: z.array(karyawanSaudaraSchema).optional(),
    tag_ids: z.array(z.number()).optional(),
});

export type KaryawanFormData = z.infer<typeof karyawanSchema>;
