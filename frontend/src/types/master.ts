export type MasterStatus = 'Aktif' | 'Tidak Aktif';

export interface BaseMaster {
    id: number;
    code: string;
    nama: string;
    keterangan?: string;
    status: MasterStatus;
    created_at: string;
    updated_at: string;
}

export type Divisi = BaseMaster;

export interface Department extends BaseMaster {
    divisi_id: number;
    manager_id?: number;
    divisi?: {
        nama: string;
    };
}

export interface PosisiJabatan extends BaseMaster {
    department_id: number;
    department?: {
        nama: string;
        divisi: {
            nama: string;
        };
    };
}

export type Golongan = BaseMaster;

export type SubGolongan = BaseMaster;

export type KategoriPangkat = BaseMaster;

export type JenisHubunganKerja = BaseMaster;

export type StatusKaryawan = BaseMaster;

export interface LokasiKerja extends BaseMaster {
    alamat?: string;
}

export interface Tag extends BaseMaster {
    warna: string;
}
