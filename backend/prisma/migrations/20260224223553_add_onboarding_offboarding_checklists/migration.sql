-- AlterTable
ALTER TABLE "karyawan" ADD COLUMN     "status_proses" TEXT NOT NULL DEFAULT 'Aktif';

-- CreateTable
CREATE TABLE "checklist_template" (
    "id" SERIAL NOT NULL,
    "kategori" TEXT NOT NULL,
    "tugas" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "is_wajib" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan_checklist" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,
    "is_selesai" BOOLEAN NOT NULL DEFAULT false,
    "tanggal_selesai" TIMESTAMP(3),
    "catatan" TEXT,
    "user_pemeriksa_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karyawan_checklist_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "karyawan_checklist" ADD CONSTRAINT "karyawan_checklist_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_checklist" ADD CONSTRAINT "karyawan_checklist_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "checklist_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
