-- CreateTable
CREATE TABLE "divisi" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "divisi_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "manager_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posisi_jabatan" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posisi_jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_pangkat" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pangkat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golongan" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golongan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_golongan" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_golongan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_hubungan_kerja" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_hubungan_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "warna" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokasi_kerja" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lokasi_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_karyawan" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan" (
    "id" SERIAL NOT NULL,
    "foto_karyawan" TEXT,
    "nama_lengkap" TEXT NOT NULL,
    "nomor_induk_karyawan" TEXT NOT NULL,
    "divisi_id" INTEGER,
    "department_id" INTEGER,
    "manager_id" INTEGER,
    "atasan_langsung_id" INTEGER,
    "posisi_jabatan_id" INTEGER,
    "email_perusahaan" TEXT,
    "nomor_handphone" TEXT,
    "status_karyawan_id" INTEGER,
    "lokasi_kerja_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan_tag" (
    "karyawan_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "karyawan_tag_pkey" PRIMARY KEY ("karyawan_id","tag_id")
);

-- CreateTable
CREATE TABLE "karyawan_personal" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "jenis_kelamin" TEXT,
    "tempat_lahir" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "email_pribadi" TEXT,
    "agama" TEXT,
    "golongan_darah" TEXT,
    "nomor_kartu_keluarga" TEXT,
    "nomor_ktp" TEXT,
    "nomor_npwp" TEXT,
    "nomor_bpjs" TEXT,
    "no_nik_kk" TEXT,
    "status_pajak" TEXT,
    "alamat_domisili" TEXT,
    "kota_domisili" TEXT,
    "provinsi_domisili" TEXT,
    "alamat_ktp" TEXT,
    "kota_ktp" TEXT,
    "provinsi_ktp" TEXT,
    "nomor_handphone_2" TEXT,
    "nomor_telepon_rumah_1" TEXT,
    "nomor_telepon_rumah_2" TEXT,
    "status_pernikahan" TEXT,
    "nama_pasangan" TEXT,
    "tanggal_menikah" TIMESTAMP(3),
    "tanggal_cerai" TIMESTAMP(3),
    "tanggal_wafat_pasangan" TIMESTAMP(3),
    "pekerjaan_pasangan" TEXT,
    "jumlah_anak" INTEGER,
    "nomor_rekening" TEXT,
    "nama_pemegang_rekening" TEXT,
    "nama_bank" TEXT,
    "cabang_bank" TEXT,

    CONSTRAINT "karyawan_personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan_hr" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "jenis_hubungan_kerja_id" INTEGER,
    "tanggal_masuk_group" TIMESTAMP(3),
    "tanggal_masuk" TIMESTAMP(3),
    "tanggal_permanent" TIMESTAMP(3),
    "tanggal_kontrak" TIMESTAMP(3),
    "tanggal_akhir_kontrak" TIMESTAMP(3),
    "tanggal_berhenti" TIMESTAMP(3),
    "tingkat_pendidikan" TEXT,
    "bidang_studi" TEXT,
    "nama_sekolah" TEXT,
    "kota_sekolah" TEXT,
    "status_kelulusan" TEXT,
    "keterangan_pendidikan" TEXT,
    "kategori_pangkat_id" INTEGER,
    "golongan_id" INTEGER,
    "sub_golongan_id" INTEGER,
    "no_dana_pensiun" TEXT,
    "emergency_nama_1" TEXT,
    "emergency_nomor_1" TEXT,
    "emergency_hubungan_1" TEXT,
    "emergency_alamat_1" TEXT,
    "emergency_nama_2" TEXT,
    "emergency_nomor_2" TEXT,
    "emergency_hubungan_2" TEXT,
    "emergency_alamat_2" TEXT,
    "point_of_original" TEXT,
    "point_of_hire" TEXT,
    "ukuran_seragam_kerja" TEXT,
    "ukuran_sepatu_kerja" TEXT,
    "lokasi_sebelumnya_id" INTEGER,
    "tanggal_mutasi" TIMESTAMP(3),
    "siklus_pembayaran_gaji" TEXT,
    "costing" TEXT,
    "assign" TEXT,
    "actual" TEXT,

    CONSTRAINT "karyawan_hr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan_keluarga" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "tanggal_lahir_pasangan" TIMESTAMP(3),
    "pendidikan_terakhir_pasangan" TEXT,
    "pekerjaan_pasangan" TEXT,
    "keterangan_pasangan" TEXT,
    "anak_ke" INTEGER,
    "jumlah_saudara_kandung" INTEGER,
    "nama_ayah_mertua" TEXT,
    "tanggal_lahir_ayah_mertua" TIMESTAMP(3),
    "pendidikan_terakhir_ayah_mertua" TEXT,
    "keterangan_ayah_mertua" TEXT,
    "nama_ibu_mertua" TEXT,
    "tanggal_lahir_ibu_mertua" TIMESTAMP(3),
    "pendidikan_terakhir_ibu_mertua" TEXT,
    "keterangan_ibu_mertua" TEXT,

    CONSTRAINT "karyawan_keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan_anak" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL,
    "nama_anak" TEXT,
    "jenis_kelamin" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "keterangan" TEXT,

    CONSTRAINT "karyawan_anak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan_saudara" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL,
    "nama_saudara" TEXT,
    "jenis_kelamin" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "pendidikan_terakhir" TEXT,
    "pekerjaan" TEXT,
    "keterangan" TEXT,

    CONSTRAINT "karyawan_saudara_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisi_code_key" ON "divisi"("code");

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "posisi_jabatan_code_key" ON "posisi_jabatan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_pangkat_code_key" ON "kategori_pangkat"("code");

-- CreateIndex
CREATE UNIQUE INDEX "golongan_code_key" ON "golongan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sub_golongan_code_key" ON "sub_golongan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_hubungan_kerja_code_key" ON "jenis_hubungan_kerja"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tag_code_key" ON "tag"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lokasi_kerja_code_key" ON "lokasi_kerja"("code");

-- CreateIndex
CREATE UNIQUE INDEX "status_karyawan_code_key" ON "status_karyawan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_nomor_induk_karyawan_key" ON "karyawan"("nomor_induk_karyawan");

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_personal_karyawan_id_key" ON "karyawan_personal"("karyawan_id");

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_hr_karyawan_id_key" ON "karyawan_hr"("karyawan_id");

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_keluarga_karyawan_id_key" ON "karyawan_keluarga"("karyawan_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "karyawan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posisi_jabatan" ADD CONSTRAINT "posisi_jabatan_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "karyawan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_atasan_langsung_id_fkey" FOREIGN KEY ("atasan_langsung_id") REFERENCES "karyawan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_posisi_jabatan_id_fkey" FOREIGN KEY ("posisi_jabatan_id") REFERENCES "posisi_jabatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_status_karyawan_id_fkey" FOREIGN KEY ("status_karyawan_id") REFERENCES "status_karyawan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_lokasi_kerja_id_fkey" FOREIGN KEY ("lokasi_kerja_id") REFERENCES "lokasi_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_tag" ADD CONSTRAINT "karyawan_tag_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_tag" ADD CONSTRAINT "karyawan_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_personal" ADD CONSTRAINT "karyawan_personal_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_hr" ADD CONSTRAINT "karyawan_hr_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_hr" ADD CONSTRAINT "karyawan_hr_jenis_hubungan_kerja_id_fkey" FOREIGN KEY ("jenis_hubungan_kerja_id") REFERENCES "jenis_hubungan_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_hr" ADD CONSTRAINT "karyawan_hr_kategori_pangkat_id_fkey" FOREIGN KEY ("kategori_pangkat_id") REFERENCES "kategori_pangkat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_hr" ADD CONSTRAINT "karyawan_hr_golongan_id_fkey" FOREIGN KEY ("golongan_id") REFERENCES "golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_hr" ADD CONSTRAINT "karyawan_hr_sub_golongan_id_fkey" FOREIGN KEY ("sub_golongan_id") REFERENCES "sub_golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_hr" ADD CONSTRAINT "karyawan_hr_lokasi_sebelumnya_id_fkey" FOREIGN KEY ("lokasi_sebelumnya_id") REFERENCES "lokasi_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_keluarga" ADD CONSTRAINT "karyawan_keluarga_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_anak" ADD CONSTRAINT "karyawan_anak_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_saudara" ADD CONSTRAINT "karyawan_saudara_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
