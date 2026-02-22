import { Row } from 'exceljs';

export const EXCEL_HEADERS = [
    "NO", "NAMA LENGKAP", "NOMOR INDUK KARYAWAN", "JENIS KELAMIN", "TEMPAT LAHIR", "TANGGAL LAHIR", "AGAMA", "STATUS PERNIKAHAN",
    "TANGGAL MENIKAH", "TANGGAL CERAI", "TANGGAL WAFAT PASANGAN", "ALAMAT KTP", "KOTA KTP", "PROVINSI KTP", "ALAMAT DOMISILI",
    "KOTA DOMISILI", "PROVINSI DOMISILI", "GOLONGAN DARAH", "NOMOR TELEPON RUMAH 1", "NOMOR TELEPON RUMAH 2", "NOMOR HANDPHONE 1",
    "NOMOR HANDPHONE 2", "TINGKAT PENDIDIKAN", "BIDANG STUDI", "NAMA SEKOLAH", "KOTA SEKOLAH", "STATUS KELULUSAN", "KETERANGAN PENDIDIKAN",
    "JENIS HUBUNGAN KERJA", "TANGGAL MASUK GROUP", "TANGGAL MASUK", "TANGGAL PERMANENT", "TANGGAL KONTRAK", "TANGGAL AKHIR KONTRAK",
    "TANGGAL BERHENTI", "KATEGORI PANGKAT", "GOLONGAN PANGKAT", "SUB GOLONGAN PANGKAT", "DANA PENSIUN", "SIKLUS PEMBAYARAN GAJI",
    "COSTING", "ASSIGN", "ACTUAL", "NOMOR REKENING", "NAMA PEMEGANG REKENING", "NAMA BANK", "CABANG BANK", "STATUS PAJAK",
    "NOMOR KTP", "NOMOR NPWP", "NOMOR BPJS", "NAMA PASANGAN", "TANGGAL LAHIR PASANGAN", "PENDIDIKAN TERAKHIR PASANGAN",
    "PEKERJAAN PASANGAN", "KETERANGAN PASANGAN", "JUMLAH ANAK", "ANAK KE", "JUMLAH SAUDARA KANDUNG", "NAMA ANAK 1", "JENIS KELAMIN ANAK 1",
    "TANGGAL LAHIR ANAK 1", "KETERANGAN ANAK 1", "NAMA ANAK 2", "JENIS KELAMIN ANAK 2", "TANGGAL LAHIR ANAK 2", "KETERANGAN ANAK 2",
    "NAMA ANAK 3", "JENIS KELAMIN ANAK 3", "TANGGAL LAHIR ANAK 3", "KETERANGAN ANAK 3", "NAMA ANAK 4", "JENIS KELAMIN ANAK 4",
    "TANGGAL LAHIR ANAK 4", "KETERANGAN ANAK 4", "NAMA SAUDARA KANDUNG 1", "JENIS KELAMIN SAUDARA KANDUNG 1", "TANGGAL LAHIR SAUDARA KANDUNG 1",
    "PENDIDIKAN TERAKHIR SAUDARA KANDUNG 1", "PEKERJAAN SAUDARA KANDUNG 1", "KETERANGAN SAUDARA KANDUNG 1", "NAMA SAUDARA KANDUNG 2",
    "JENIS KELAMIN SAUDARA KANDUNG 2", "TANGGAL LAHIR SAUDARA KANDUNG 2", "PENDIDIKAN TERAKHIR SAUDARA KANDUNG 2", "PEKERJAAN SAUDARA KANDUNG 2",
    "KETERANGAN SAUDARA KANDUNG 2", "NAMA SAUDARA KANDUNG 3", "JENIS KELAMIN SAUDARA KANDUNG 3", "TANGGAL LAHIR SAUDARA KANDUNG 3",
    "PENDIDIKAN TERAKHIR SAUDARA KANDUNG 3", "PEKERJAAN SAUDARA KANDUNG 3", "KETERANGAN SAUDARA KANDUNG 3", "NAMA SAUDARA KANDUNG 4",
    "JENIS KELAMIN SAUDARA KANDUNG 4", "TANGGAL LAHIR SAUDARA KANDUNG 4", "PENDIDIKAN TERAKHIR SAUDARA KANDUNG 4", "PEKERJAAN SAUDARA KANDUNG 4",
    "KETERANGAN SAUDARA KANDUNG 4", "NAMA SAUDARA KANDUNG 5", "JENIS KELAMIN SAUDARA KANDUNG 5", "TANGGAL LAHIR SAUDARA KANDUNG 5",
    "PENDIDIKAN TERAKHIR SAUDARA KANDUNG 5", "PEKERJAAN SAUDARA KANDUNG 5", "KETERANGAN SAUDARA KANDUNG 5", "NAMA BAPAK MERTUA",
    "TANGGAL LAHUR BAPAK MERTUA", "PENDIDKAN TERAKHIR BAPAK MERTUA", "PEKERJAAN BAPAK MERTUA", "KETERANGAN BAPAK MERTUA",
    "NAMA IBU MERTUA", "TANGGAL LAHIR IBU MERTUA", "PENDIDIKAN TERAKHIR IBU MERTUA", "PEKERJAAN IBU MERTUA", "KETERANGAN IBU MERTUA",
    "ORGANISSASI SUB DEPARTMENT", "DEPARTMENT", "DIVISI", "NAMA KONTAK DARURAT 1", "HUNGAN KONTRAK DARURAT 1", "ALAMAT KONTAK DARURAT 1",
    "NOMOR HP1 KONTAK DARURAT 1", "NOMOR HP2 KONTAK DARURAT 1", "UKURAN SEPATU", "UKURAN BAJU", "LOKASI SEBELUMNYA", "TANGGAL MUTASI",
    "UNIT YANG DI BAWAH", "POINT OF ORIGINAL", "POINT OF HIRE", "NOMOR KARTU KELUARGA", "NOMOR NIK KK", "LOKASI KERJA", "STATUS KARYAWAN",
    "TAG", "MANAGER", "ATASAN LANGSUNG", "EMAIL PERUSAHAAN", "EMAIL PRIBADI"
];

export const buildExportHeaders = () => EXCEL_HEADERS;

const formatDate = (val: any): Date | null => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
};

const formatInt = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const n = parseInt(val);
    return isNaN(n) ? null : n;
};

export const parseImportRow = (row: Row, headers: string[]) => {
    const data: any = {};
    headers.forEach((header, index) => {
        const cellValue = row.getCell(index + 1).value;
        data[header.toUpperCase()] = cellValue === null ? '' : cellValue;
    });

    const head = {
        nama_lengkap: String(data["NAMA LENGKAP"] || ''),
        nomor_induk_karyawan: String(data["NOMOR INDUK KARYAWAN"] || ''),
        email_perusahaan: String(data["EMAIL PERUSAHAAN"] || ''),
        nomor_handphone: String(data["NOMOR HANDPHONE 1"] || ''),
        // Relasi (Nama, perlu di-resolve ke ID di controller)
        divisi_nama: String(data["DIVISI"] || ''),
        department_nama: String(data["DEPARTMENT"] || ''),
        posisi_jabatan_nama: String(data["DEPARTMENT"] || ''), // Seringkali sama di excel? atau ada kolom jabatan spesifik? 
        // Ternyata di excel tidak ada kolom "POSISI JABATAN" spesifik, tapi ada "ORGANISSASI SUB DEPARTMENT"
        // Saya asumsikan Posisi Jabatan mungkin dari kolom lain atau mapping tertentu.
        // Cek lagi: ada "DEPARTMENT" dan "DIVISI". 
        // Ah, Posisi Jabatan di schema berelasi ke Department.
        status_karyawan_nama: String(data["STATUS KARYAWAN"] || ''),
        lokasi_kerja_nama: String(data["LOKASI KERJA"] || ''),
        tag_nama: String(data["TAG"] || ''),
        manager_nik: String(data["MANAGER"] || ''),
        atasan_nik: String(data["ATASAN LANGSUNG"] || '')
    };

    const personal = {
        jenis_kelamin: String(data["JENIS KELAMIN"] || ''),
        tempat_lahir: String(data["TEMPAT LAHIR"] || ''),
        tanggal_lahir: formatDate(data["TANGGAL LAHIR"]),
        email_pribadi: String(data["EMAIL PRIBADI"] || ''),
        agama: String(data["AGAMA"] || ''),
        golongan_darah: String(data["GOLONGAN DARAH"] || ''),
        nomor_kartu_keluarga: String(data["NOMOR KARTU KELUARGA"] || ''),
        nomor_ktp: String(data["NOMOR KTP"] || ''),
        nomor_npwp: String(data["NOMOR NPWP"] || ''),
        nomor_bpjs: String(data["NOMOR BPJS"] || ''),
        no_nik_kk: String(data["NOMOR NIK KK"] || ''),
        status_pajak: String(data["STATUS PAJAK"] || ''),
        alamat_domisili: String(data["ALAMAT DOMISILI"] || ''),
        kota_domisili: String(data["KOTA DOMISILI"] || ''),
        provinsi_domisili: String(data["PROVINSI DOMISILI"] || ''),
        alamat_ktp: String(data["ALAMAT KTP"] || ''),
        kota_ktp: String(data["KOTA KTP"] || ''),
        provinsi_ktp: String(data["PROVINSI KTP"] || ''),
        nomor_handphone_2: String(data["NOMOR HANDPHONE 2"] || ''),
        nomor_telepon_rumah_1: String(data["NOMOR TELEPON RUMAH 1"] || ''),
        nomor_telepon_rumah_2: String(data["NOMOR TELEPON RUMAH 2"] || ''),
        status_pernikahan: String(data["STATUS PERNIKAHAN"] || ''),
        nama_pasangan: String(data["NAMA PASANGAN"] || ''),
        tanggal_menikah: formatDate(data["TANGGAL MENIKAH"]),
        tanggal_cerai: formatDate(data["TANGGAL CERAI"]),
        tanggal_wafat_pasangan: formatDate(data["TANGGAL WAFAT PASANGAN"]),
        pekerjaan_pasangan: String(data["PEKERJAAN PASANGAN"] || ''),
        jumlah_anak: formatInt(data["JUMLAH ANAK"]),
        nomor_rekening: String(data["NOMOR REKENING"] || ''),
        nama_pemegang_rekening: String(data["NAMA PEMEGANG REKENING"] || ''),
        nama_bank: String(data["NAMA BANK"] || ''),
        cabang_bank: String(data["CABANG BANK"] || '')
    };

    const hr = {
        jenis_hubungan_kerja_nama: String(data["JENIS HUBUNGAN KERJA"] || ''),
        tanggal_masuk_group: formatDate(data["TANGGAL MASUK GROUP"]),
        tanggal_masuk: formatDate(data["TANGGAL MASUK"]),
        tanggal_permanent: formatDate(data["TANGGAL PERMANENT"]),
        tanggal_kontrak: formatDate(data["TANGGAL KONTRAK"]),
        tanggal_akhir_kontrak: formatDate(data["TANGGAL AKHIR KONTRAK"]),
        tanggal_berhenti: formatDate(data["TANGGAL BERHENTI"]),
        tingkat_pendidikan: String(data["TINGKAT PENDIDIKAN"] || ''),
        bidang_studi: String(data["BIDANG STUDI"] || ''),
        nama_sekolah: String(data["NAMA SEKOLAH"] || ''),
        kota_sekolah: String(data["KOTA SEKOLAH"] || ''),
        status_kelulusan: String(data["STATUS KELULUSAN"] || ''),
        keterangan_pendidikan: String(data["KETERANGAN PENDIDIKAN"] || ''),
        kategori_pangkat_nama: String(data["KATEGORI PANGKAT"] || ''),
        golongan_nama: String(data["GOLONGAN PANGKAT"] || ''),
        sub_golongan_nama: String(data["SUB GOLONGAN PANGKAT"] || ''),
        no_dana_pensiun: String(data["DANA PENSIUN"] || ''),
        emergency_nama_1: String(data["NAMA KONTAK DARURAT 1"] || ''),
        emergency_hubungan_1: String(data["HUNGAN KONTRAK DARURAT 1"] || ''),
        emergency_alamat_1: String(data["ALAMAT KONTAK DARURAT 1"] || ''),
        emergency_nomor_1: String(data["NOMOR HP1 KONTAK DARURAT 1"] || ''),
        emergency_nomor_2: String(data["NOMOR HP2 KONTAK DARURAT 1"] || ''), // Asumsi HP2 adalah darurat 2? atau darurat 1 hp 2?
        ukuran_seragam_kerja: String(data["UKURAN BAJU"] || ''),
        ukuran_sepatu_kerja: String(data["UKURAN SEPATU"] || ''),
        lokasi_sebelumnya_nama: String(data["LOKASI SEBELUMNYA"] || ''),
        tanggal_mutasi: formatDate(data["TANGGAL MUTASI"]),
        point_of_original: String(data["POINT OF ORIGINAL"] || ''),
        point_of_hire: String(data["POINT OF HIRE"] || ''),
        siklus_pembayaran_gaji: String(data["SIKLUS PEMBAYARAN GAJI"] || ''),
        costing: String(data["COSTING"] || ''),
        assign: String(data["ASSIGN"] || ''),
        actual: String(data["ACTUAL"] || '')
    };

    const keluarga = {
        tanggal_lahir_pasangan: formatDate(data["TANGGAL LAHIR PASANGAN"]),
        pendidikan_terakhir_pasangan: String(data["PENDIDIKAN TERAKHIR PASANGAN"] || ''),
        pekerjaan_pasangan: String(data["PEKERJAAN PASANGAN"] || ''),
        keterangan_pasangan: String(data["KETERANGAN PASANGAN"] || ''),
        anak_ke: formatInt(data["ANAK KE"]),
        jumlah_saudara_kandung: formatInt(data["JUMLAH SAUDARA KANDUNG"]),
        nama_ayah_mertua: String(data["NAMA BAPAK MERTUA"] || ''),
        tanggal_lahir_ayah_mertua: formatDate(data["TANGGAL LAHUR BAPAK MERTUA"]),
        pendidikan_terakhir_ayah_mertua: String(data["PENDIDKAN TERAKHIR BAPAK MERTUA"] || ''),
        keterangan_ayah_mertua: String(data["KETERANGAN BAPAK MERTUA"] || ''),
        nama_ibu_mertua: String(data["NAMA IBU MERTUA"] || ''),
        tanggal_lahir_ibu_mertua: formatDate(data["TANGGAL LAHIR IBU MERTUA"]),
        pendidikan_terakhir_ibu_mertua: String(data["PENDIDIKAN TERAKHIR IBU MERTUA"] || ''),
        keterangan_ibu_mertua: String(data["KETERANGAN IBU MERTUA"] || '')
    };

    const anak = [];
    for (let i = 1; i <= 4; i++) {
        if (data[`NAMA ANAK ${i}`]) {
            anak.push({
                urutan: i,
                nama_anak: String(data[`NAMA ANAK ${i}`]),
                jenis_kelamin: String(data[`JENIS KELAMIN ANAK ${i}`]),
                tanggal_lahir: formatDate(data[`TANGGAL LAHIR ANAK ${i}`]),
                keterangan: String(data[`KETERANGAN ANAK ${i}`])
            });
        }
    }

    const saudara = [];
    for (let i = 1; i <= 5; i++) {
        if (data[`NAMA SAUDARA KANDUNG ${i}`]) {
            saudara.push({
                urutan: i,
                nama_saudara: String(data[`NAMA SAUDARA KANDUNG ${i}`]),
                jenis_kelamin: String(data[`JENIS KELAMIN SAUDARA KANDUNG ${i}`]),
                tanggal_lahir: formatDate(data[`TANGGAL LAHIR SAUDARA KANDUNG ${i}`]),
                pendidikan_terakhir: String(data[`PENDIDIKAN TERAKHIR SAUDARA KANDUNG ${i}`]),
                pekerjaan: String(data[`PEKERJAAN SAUDARA KANDUNG ${i}`]),
                keterangan: String(data[`KETERANGAN SAUDARA KANDUNG ${i}`])
            });
        }
    }

    return { head, personal, hr, keluarga, anak, saudara };
};

export const buildExportRow = (k: any) => {
    const row = new Array(EXCEL_HEADERS.length).fill('');

    const getVal = (header: string) => {
        switch (header) {
            case "NAMA LENGKAP": return k.nama_lengkap;
            case "NOMOR INDUK KARYAWAN": return k.nomor_induk_karyawan;
            case "JENIS KELAMIN": return k.personal?.jenis_kelamin;
            case "TEMPAT LAHIR": return k.personal?.tempat_lahir;
            case "TANGGAL LAHIR": return k.personal?.tanggal_lahir;
            case "AGAMA": return k.personal?.agama;
            case "STATUS PERNIKAHAN": return k.personal?.status_pernikahan;
            case "TANGGAL MENIKAH": return k.personal?.tanggal_menikah;
            case "TANGGAL CERAI": return k.personal?.tanggal_cerai;
            case "TANGGAL WAFAT PASANGAN": return k.personal?.tanggal_wafat_pasangan;
            case "ALAMAT KTP": return k.personal?.alamat_ktp;
            case "KOTA KTP": return k.personal?.kota_ktp;
            case "PROVINSI KTP": return k.personal?.provinsi_ktp;
            case "ALAMAT DOMISILI": return k.personal?.alamat_domisili;
            case "KOTA DOMISILI": return k.personal?.kota_domisili;
            case "PROVINSI DOMISILI": return k.personal?.provinsi_domisili;
            case "GOLONGAN DARAH": return k.personal?.golongan_darah;
            case "NOMOR TELEPON RUMAH 1": return k.personal?.nomor_telepon_rumah_1;
            case "NOMOR TELEPON RUMAH 2": return k.personal?.nomor_telepon_rumah_2;
            case "NOMOR HANDPHONE 1": return k.nomor_handphone; // dari head
            case "NOMOR HANDPHONE 2": return k.personal?.nomor_handphone_2;
            case "TINGKAT PENDIDIKAN": return k.hr?.tingkat_pendidikan;
            case "BIDANG STUDI": return k.hr?.bidang_studi;
            case "NAMA SEKOLAH": return k.hr?.nama_sekolah;
            case "KOTA SEKOLAH": return k.hr?.kota_sekolah;
            case "STATUS KELULUSAN": return k.hr?.status_kelulusan;
            case "KETERANGAN PENDIDIKAN": return k.hr?.keterangan_pendidikan;
            case "JENIS HUBUNGAN KERJA": return k.hr?.jenis_hubungan_kerja?.nama;
            case "TANGGAL MASUK GROUP": return k.hr?.tanggal_masuk_group;
            case "TANGGAL MASUK": return k.hr?.tanggal_masuk;
            case "TANGGAL PERMANENT": return k.hr?.tanggal_permanent;
            case "TANGGAL KONTRAK": return k.hr?.tanggal_kontrak;
            case "TANGGAL AKHIR KONTRAK": return k.hr?.tanggal_akhir_kontrak;
            case "TANGGAL BERHENTI": return k.hr?.tanggal_berhenti;
            case "KATEGORI PANGKAT": return k.hr?.kategori_pangkat?.nama;
            case "GOLONGAN PANGKAT": return k.hr?.golongan?.nama;
            case "SUB GOLONGAN PANGKAT": return k.hr?.sub_golongan?.nama;
            case "DANA PENSIUN": return k.hr?.no_dana_pensiun;
            case "SIKLUS PEMBAYARAN GAJI": return k.hr?.siklus_pembayaran_gaji;
            case "COSTING": return k.hr?.costing;
            case "ASSIGN": return k.hr?.assign;
            case "ACTUAL": return k.hr?.actual;
            case "NOMOR REKENING": return k.personal?.nomor_rekening;
            case "NAMA PEMEGANG REKENING": return k.personal?.nama_pemegang_rekening;
            case "NAMA BANK": return k.personal?.nama_bank;
            case "CABANG BANK": return k.personal?.cabang_bank;
            case "STATUS PAJAK": return k.personal?.status_pajak;
            case "NOMOR KTP": return k.personal?.nomor_ktp;
            case "NOMOR NPWP": return k.personal?.nomor_npwp;
            case "NOMOR BPJS": return k.personal?.nomor_bpjs;
            case "NAMA PASANGAN": return k.personal?.nama_pasangan;
            case "TANGGAL LAHIR PASANGAN": return k.keluarga?.tanggal_lahir_pasangan;
            case "PENDIDIKAN TERAKHIR PASANGAN": return k.keluarga?.pendidikan_terakhir_pasangan;
            case "PEKERJAAN PASANGAN": return k.keluarga?.pekerjaan_pasangan;
            case "KETERANGAN PASANGAN": return k.keluarga?.keterangan_pasangan;
            case "JUMLAH ANAK": return k.personal?.jumlah_anak;
            case "ANAK KE": return k.keluarga?.anak_ke;
            case "JUMLAH SAUDARA KANDUNG": return k.keluarga?.jumlah_saudara_kandung;
            case "DEPARTMENT": return k.department?.nama;
            case "DIVISI": return k.divisi?.nama;
            case "LOKASI KERJA": return k.lokasi_kerja?.nama;
            case "STATUS KARYAWAN": return k.status_karyawan?.nama;
            case "TAG": return k.tags?.[0]?.tag?.nama;
            case "MANAGER": return k.manager?.nama_lengkap;
            case "ATASAN LANGSUNG": return k.atasan_langsung?.nama_lengkap;
            case "EMAIL PERUSAHAAN": return k.email_perusahaan;
            case "EMAIL PRIBADI": return k.personal?.email_pribadi;
            case "NOMOR KARTU KELUARGA": return k.personal?.nomor_kartu_keluarga;
            case "NOMOR NIK KK": return k.personal?.no_nik_kk;
            case "UKURAN SEPATU": return k.hr?.ukuran_sepatu_kerja;
            case "UKURAN BAJU": return k.hr?.ukuran_seragam_kerja;
            case "POINT OF ORIGINAL": return k.hr?.point_of_original;
            case "POINT OF HIRE": return k.hr?.point_of_hire;
            case "NAMA KONTAK DARURAT 1": return k.hr?.emergency_nama_1;
            case "HUNGAN KONTRAK DARURAT 1": return k.hr?.emergency_hubungan_1;
            case "ALAMAT KONTAK DARURAT 1": return k.hr?.emergency_alamat_1;
            case "NOMOR HP1 KONTAK DARURAT 1": return k.hr?.emergency_nomor_1;
            case "NOMOR HP2 KONTAK DARURAT 1": return k.hr?.emergency_nomor_2;
            case "LOKASI SEBELUMNYA": return k.hr?.lokasi_sebelumnya?.nama;
            case "TANGGAL MUTASI": return k.hr?.tanggal_mutasi;
            case "NAMA BAPAK MERTUA": return k.keluarga?.nama_ayah_mertua;
            case "TANGGAL LAHUR BAPAK MERTUA": return k.keluarga?.tanggal_lahir_ayah_mertua;
            case "PENDIDKAN TERAKHIR BAPAK MERTUA": return k.keluarga?.pendidikan_terakhir_ayah_mertua;
            case "PEKERJAAN BAPAK MERTUA": return k.keluarga?.pekerjaan_ayah_mertua;
            case "KETERANGAN BAPAK MERTUA": return k.keluarga?.keterangan_ayah_mertua;
            case "NAMA IBU MERTUA": return k.keluarga?.nama_ibu_mertua;
            case "TANGGAL LAHIR IBU MERTUA": return k.keluarga?.tanggal_lahir_ibu_mertua;
            case "PENDIDIKAN TERAKHIR IBU MERTUA": return k.keluarga?.pendidikan_terakhir_ibu_mertua;
            case "PEKERJAAN IBU MERTUA": return k.keluarga?.pekerjaan_ibu_mertua;
            case "KETERANGAN IBU MERTUA": return k.keluarga?.keterangan_ibu_mertua;
            case "ORGANISSASI SUB DEPARTMENT": return k.department?.nama; // mapping default
            // Anak & Saudara (hanya untuk export header statis yang simpel, 
            // tapi kita butuh mapping dinamis untuk ANAK 1, 2 dst)
            default:
                if (header.startsWith("NAMA ANAK ")) {
                    const idx = parseInt(header.split(' ')[2]) - 1;
                    return k.anak?.[idx]?.nama_anak;
                }
                if (header.startsWith("JENIS KELAMIN ANAK ")) {
                    const idx = parseInt(header.split(' ')[3]) - 1;
                    return k.anak?.[idx]?.jenis_kelamin;
                }
                if (header.startsWith("TANGGAL LAHIR ANAK ")) {
                    const idx = parseInt(header.split(' ')[3]) - 1;
                    return k.anak?.[idx]?.tanggal_lahir;
                }
                if (header.startsWith("KETERANGAN ANAK ")) {
                    const idx = parseInt(header.split(' ')[2]) - 1;
                    return k.anak?.[idx]?.keterangan;
                }
                if (header.startsWith("NAMA SAUDARA KANDUNG ")) {
                    const idx = parseInt(header.split(' ')[3]) - 1;
                    return k.saudara?.[idx]?.nama_saudara;
                }
                if (header.startsWith("JENIS KELAMIN SAUDARA KANDUNG ")) {
                    const idx = parseInt(header.split(' ')[4]) - 1;
                    return k.saudara?.[idx]?.jenis_kelamin;
                }
                if (header.startsWith("TANGGAL LAHIR SAUDARA KANDUNG ")) {
                    const idx = parseInt(header.split(' ')[4]) - 1;
                    return k.saudara?.[idx]?.tanggal_lahir;
                }
                if (header.startsWith("PENDIDIKAN TERAKHIR SAUDARA KANDUNG ")) {
                    const idx = parseInt(header.split(' ')[4]) - 1;
                    return k.saudara?.[idx]?.pendidikan_terakhir;
                }
                if (header.startsWith("PEKERJAAN SAUDARA KANDUNG ")) {
                    const idx = parseInt(header.split(' ')[3]) - 1;
                    return k.saudara?.[idx]?.pekerjaan;
                }
                if (header.startsWith("KETERANGAN SAUDARA KANDUNG ")) {
                    const idx = parseInt(header.split(' ')[3]) - 1;
                    return k.saudara?.[idx]?.keterangan;
                }
                return '';
        }
    };

    EXCEL_HEADERS.forEach((header, index) => {
        row[index] = getVal(header);
    });

    return row;
};
