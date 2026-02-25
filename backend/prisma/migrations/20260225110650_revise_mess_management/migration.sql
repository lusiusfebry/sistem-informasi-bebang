/*
  Warnings:

  - You are about to drop the column `lokasi` on the `mess` table. All the data in the column will be lost.
  - You are about to drop the column `fasilitas` on the `mess_room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mess" DROP COLUMN "lokasi",
ADD COLUMN     "blok" TEXT,
ADD COLUMN     "lantai" TEXT,
ADD COLUMN     "lokasi_kerja_id" INTEGER;

-- AlterTable
ALTER TABLE "mess_room" DROP COLUMN "fasilitas",
ADD COLUMN     "tipe" TEXT;

-- CreateTable
CREATE TABLE "mess_facility" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "mess_facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_facility_on_room" (
    "room_id" INTEGER NOT NULL,
    "facility_id" INTEGER NOT NULL,

    CONSTRAINT "mess_facility_on_room_pkey" PRIMARY KEY ("room_id","facility_id")
);

-- CreateTable
CREATE TABLE "mess_petugas" (
    "id" SERIAL NOT NULL,
    "mess_id" INTEGER NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "shift" TEXT,

    CONSTRAINT "mess_petugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_assignment" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_keluar" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "keterangan" TEXT,

    CONSTRAINT "mess_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_damage_report" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "kategori" TEXT,
    "deskripsi" TEXT NOT NULL,
    "foto_kerusakan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Dilaporkan',
    "tanggal_laporan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_selesai" TIMESTAMP(3),

    CONSTRAINT "mess_damage_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_cleaning_schedule" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "tanggal_jadwal" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Terjadwal',
    "catatan" TEXT,

    CONSTRAINT "mess_cleaning_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mess_facility_nama_key" ON "mess_facility"("nama");

-- AddForeignKey
ALTER TABLE "mess" ADD CONSTRAINT "mess_lokasi_kerja_id_fkey" FOREIGN KEY ("lokasi_kerja_id") REFERENCES "lokasi_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_facility_on_room" ADD CONSTRAINT "mess_facility_on_room_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "mess_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_facility_on_room" ADD CONSTRAINT "mess_facility_on_room_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "mess_facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_petugas" ADD CONSTRAINT "mess_petugas_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_petugas" ADD CONSTRAINT "mess_petugas_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_assignment" ADD CONSTRAINT "mess_assignment_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "mess_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_assignment" ADD CONSTRAINT "mess_assignment_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_damage_report" ADD CONSTRAINT "mess_damage_report_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "mess_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_cleaning_schedule" ADD CONSTRAINT "mess_cleaning_schedule_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "mess_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
