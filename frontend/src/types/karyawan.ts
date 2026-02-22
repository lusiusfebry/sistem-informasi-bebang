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
    jumlah_anak: number | null;
    nomor_rekening: string | null;
    nama_pemegang_rekening: string | null;
    nama_bank: string | null;
    cabang_bank: string | null;
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

export interface KaryawanDetail extends KaryawanListItem {
    email_perusahaan: string | null;
    nomor_handphone: string | null;
    manager: { nama_lengkap: string; nomor_induk_karyawan: string } | null;
    atasan_langsung: { nama_lengkap: string; nomor_induk_karyawan: string } | null;
    personal: KaryawanPersonal | null;
    hr: KaryawanHR | null;
    anak: KaryawanAnak[];
    saudara: KaryawanSaudara[];
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
