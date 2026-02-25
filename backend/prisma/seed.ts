import prisma from "../src/lib/prisma";

async function main() {
    console.log("Starting seeding...");

    // 1. Divisi
    await prisma.divisi.createMany({
        data: [
            { code: "div-OPS", nama: "Operations", keterangan: "Divisi Operasional" },
            { code: "div-HRD", nama: "Human Resources", keterangan: "Divisi SDM" },
            { code: "div-FIN", nama: "Finance", keterangan: "Divisi Keuangan" },
        ],
        skipDuplicates: true,
    });

    const hrd = await prisma.divisi.findUnique({ where: { code: "div-HRD" } });
    const ops = await prisma.divisi.findUnique({ where: { code: "div-OPS" } });

    // 2. Department
    if (hrd && ops) {
        await prisma.department.createMany({
            data: [
                { divisi_id: hrd.id, code: "dep-REC", nama: "Recruitment", keterangan: "Dept Rekrutmen" },
                { divisi_id: hrd.id, code: "dep-PAY", nama: "Payroll", keterangan: "Dept Penggajian" },
                { divisi_id: ops.id, code: "dep-IT", nama: "Information Technology", keterangan: "Dept IT" },
            ],
            skipDuplicates: true,
        });
    }

    // 3. Posisi Jabatan
    const depIt = await prisma.department.findUnique({ where: { code: "dep-IT" } });
    if (depIt) {
        await prisma.posisi_jabatan.createMany({
            data: [
                { department_id: depIt.id, code: "pos-MGR", nama: "Manager", keterangan: "Manager IT" },
                { department_id: depIt.id, code: "pos-STF", nama: "Staff", keterangan: "Staff IT" },
            ],
            skipDuplicates: true,
        });
    }

    // 4. Kategori Pangkat
    await prisma.kategori_pangkat.createMany({
        data: [
            { code: "kpk-STAFF", nama: "Staff" },
            { code: "kpk-MGR", nama: "Management" },
        ],
        skipDuplicates: true,
    });

    // 5. Golongan
    await prisma.golongan.createMany({
        data: [
            { code: "gol-1", nama: "Golongan I" },
            { code: "gol-2", nama: "Golongan II" },
        ],
        skipDuplicates: true,
    });

    // 6. Sub Golongan
    await prisma.sub_golongan.createMany({
        data: [
            { code: "sgol-1A", nama: "1A" },
            { code: "sgol-1B", nama: "1B" },
        ],
        skipDuplicates: true,
    });

    // 7. Jenis Hubungan Kerja
    await prisma.jenis_hubungan_kerja.createMany({
        data: [
            { code: "jhk-PKWT", nama: "Kontrak" },
            { code: "jhk-PKWTT", nama: "Tetap" },
        ],
        skipDuplicates: true,
    });

    // 8. Tag
    await prisma.tag.createMany({
        data: [
            { code: "tag-VIP", nama: "VIP", warna: "#FF0000" },
            { code: "tag-NEW", nama: "New Hire", warna: "#00FF00" },
        ],
        skipDuplicates: true,
    });

    // 9. Lokasi Kerja
    await prisma.lokasi_kerja.createMany({
        data: [
            { code: "lok-HO", nama: "Head Office", alamat: "Jakarta" },
            { code: "lok-SITE", nama: "Site Office", alamat: "Kalimantan" },
            { code: "lok-TBI", nama: "Site Taliabu", alamat: "Pulau Taliabu" },
        ],
        skipDuplicates: true,
    });

    const lokTaliabu = await prisma.lokasi_kerja.findUnique({ where: { code: "lok-TBI" } });
    const stkAktif = await prisma.status_karyawan.findUnique({ where: { code: "stk-AKTIF" } });

    // 12. Mess
    if (lokTaliabu) {
        await prisma.mess.createMany({
            data: [
                { code: "MSS-CMA", nama: "Mess Cemara", lokasi_kerja_id: lokTaliabu.id, blok: "A", lantai: "1" },
                { code: "MSS-PNS", nama: "Mess Pinus", lokasi_kerja_id: lokTaliabu.id, blok: "B", lantai: "1" },
            ],
            skipDuplicates: true,
        });
    }

    const messCemara = await prisma.mess.findUnique({ where: { code: "MSS-CMA" } });
    const messPinus = await prisma.mess.findUnique({ where: { code: "MSS-PNS" } });

    // 13. Mess Rooms
    if (messCemara && messPinus) {
        await prisma.mess_room.createMany({
            data: [
                { mess_id: messCemara.id, nomor_kamar: "101", kapasitas: 1, tipe: "VIP", status: "Tersedia" },
                { mess_id: messCemara.id, nomor_kamar: "102", kapasitas: 2, tipe: "Standard", status: "Tersedia" },
                { mess_id: messPinus.id, nomor_kamar: "201", kapasitas: 4, tipe: "Economy", status: "Tersedia" },
            ],
            skipDuplicates: true,
        });
    }

    const room101 = await prisma.mess_room.findFirst({ where: { nomor_kamar: "101" } });

    // 14. Karyawan
    if (lokTaliabu && stkAktif) {
        const karyawanData = [
            {
                nama_lengkap: "Budi Santoso",
                nomor_induk_karyawan: "20240001",
                email_perusahaan: "budi.santoso@bebang.co.id",
                nomor_handphone: "081234567890",
                lokasi_kerja_id: lokTaliabu.id,
                status_karyawan_id: stkAktif.id,
                divisi_id: ops?.id,
                department_id: depIt?.id,
                mess_room_id: room101?.id
            },
            {
                nama_lengkap: "Siti Aminah",
                nomor_induk_karyawan: "20240002",
                email_perusahaan: "siti.aminah@bebang.co.id",
                nomor_handphone: "081234567891",
                lokasi_kerja_id: lokTaliabu.id,
                status_karyawan_id: stkAktif.id,
                divisi_id: hrd?.id,
                department_id: (await prisma.department.findUnique({ where: { code: "dep-REC" } }))?.id,
            },
            {
                nama_lengkap: "Agus Setiawan",
                nomor_induk_karyawan: "20240003",
                email_perusahaan: "agus.setiawan@bebang.co.id",
                nomor_handphone: "081234567892",
                lokasi_kerja_id: lokTaliabu.id,
                status_karyawan_id: stkAktif.id,
                divisi_id: ops?.id,
            }
        ];

        for (const data of karyawanData) {
            const karyawan = await prisma.karyawan.upsert({
                where: { nomor_induk_karyawan: data.nomor_induk_karyawan },
                update: data,
                create: data,
            });

            if (data.mess_room_id) {
                await prisma.mess_assignment.create({
                    data: {
                        karyawan_id: karyawan.id,
                        room_id: data.mess_room_id,
                        tanggal_masuk: new Date(),
                        status: 'Aktif'
                    }
                });
            }
        }
    }

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
