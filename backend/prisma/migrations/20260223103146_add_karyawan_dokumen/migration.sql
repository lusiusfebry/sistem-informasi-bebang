-- AlterTable
ALTER TABLE "karyawan" ADD COLUMN     "mess_room_id" INTEGER;

-- CreateTable
CREATE TABLE "mess" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_room" (
    "id" SERIAL NOT NULL,
    "mess_id" INTEGER NOT NULL,
    "nomor_kamar" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL DEFAULT 1,
    "fasilitas" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Tersedia',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mess_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan_dokumen" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "nama_dokumen" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karyawan_dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mess_code_key" ON "mess"("code");

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_mess_room_id_fkey" FOREIGN KEY ("mess_room_id") REFERENCES "mess_room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_room" ADD CONSTRAINT "mess_room_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_dokumen" ADD CONSTRAINT "karyawan_dokumen_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
