import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

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
        ],
        skipDuplicates: true,
    });

    // 10. Status Karyawan
    await prisma.status_karyawan.createMany({
        data: [
            { code: "stk-AKTIF", nama: "Aktif" },
            { code: "stk-RESIGN", nama: "Resign" },
        ],
        skipDuplicates: true,
    });

    // SEED ADMIN USER
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.users.upsert({
        where: { nik: "00-00001" },
        update: {},
        create: {
            nama: "Administrator",
            nik: "00-00001",
            password: hashedPassword,
            role: "admin",
        },
    });

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
