import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import { parseImportRow, buildExportHeaders, buildExportRow } from '../utils/excelMapper';

const parseDate = (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr === '') return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
};

const includeFull = {
    divisi: true,
    department: true,
    posisi_jabatan: true,
    status_karyawan: true,
    lokasi_kerja: true,
    tags: { include: { tag: true } },
    personal: true,
    hr: {
        include: {
            jenis_hubungan_kerja: true,
            kategori_pangkat: true,
            golongan: true,
            sub_golongan: true,
            lokasi_sebelumnya: true
        }
    },
    keluarga: true,
    anak: { orderBy: { urutan: 'asc' as const } },
    saudara: { orderBy: { urutan: 'asc' as const } },
    manager: true,
    atasan_langsung: true,
    mess_room: { include: { mess: true } },
    dokumen: { orderBy: { created_at: 'desc' as const } },
    checklists: { orderBy: { id: 'asc' as const } }
};

export const getAll = async (req: Request, res: Response) => {
    try {
        const { search, divisi_id, department_id, status_karyawan_id, lokasi_kerja_id, page = 1, limit = 10 } = req.query;
        const p = Number(page);
        const l = Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { nama_lengkap: { contains: String(search), mode: 'insensitive' } },
                { nomor_induk_karyawan: { contains: String(search), mode: 'insensitive' } }
            ];
        }
        if (divisi_id) where.divisi_id = Number(divisi_id);
        if (department_id) where.department_id = Number(department_id);
        if (status_karyawan_id) where.status_karyawan_id = Number(status_karyawan_id);
        if (lokasi_kerja_id) where.lokasi_kerja_id = Number(lokasi_kerja_id);

        const [data, total] = await Promise.all([
            prisma.karyawan.findMany({
                where,
                include: {
                    divisi: true,
                    department: true,
                    posisi_jabatan: true,
                    status_karyawan: true,
                    lokasi_kerja: true,
                    tags: { include: { tag: true } }
                },
                skip: (p - 1) * l,
                take: l,
                orderBy: { nama_lengkap: 'asc' }
            }),
            prisma.karyawan.count({ where })
        ]);

        return res.json({
            data,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await prisma.karyawan.findUnique({
            where: { id: Number(id) },
            include: includeFull
        });

        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const { head, personal, hr, keluarga, anak, saudara, tag_ids } = req.body;

        if (!head?.nama_lengkap || !head?.nomor_induk_karyawan) {
            return res.status(400).json({ message: 'Nama lengkap dan NIK wajib diisi' });
        }

        const existing = await prisma.karyawan.findUnique({
            where: { nomor_induk_karyawan: head.nomor_induk_karyawan }
        });
        if (existing) return res.status(400).json({ message: 'NIK sudah terdaftar' });

        const result = await prisma.$transaction(async (tx) => {
            const karyawan = await tx.karyawan.create({
                data: {
                    ...head,
                    divisi_id: head.divisi_id ? Number(head.divisi_id) : undefined,
                    department_id: head.department_id ? Number(head.department_id) : undefined,
                    manager_id: head.manager_id && head.manager_id !== 'null' ? Number(head.manager_id) : null,
                    atasan_langsung_id: head.atasan_langsung_id && head.atasan_langsung_id !== 'null' ? Number(head.atasan_langsung_id) : null,
                    posisi_jabatan_id: head.posisi_jabatan_id ? Number(head.posisi_jabatan_id) : undefined,
                    status_karyawan_id: head.status_karyawan_id ? Number(head.status_karyawan_id) : undefined,
                    lokasi_kerja_id: head.lokasi_kerja_id ? Number(head.lokasi_kerja_id) : undefined,
                }
            });

            if (personal) {
                await tx.karyawan_personal.create({
                    data: {
                        ...personal,
                        karyawan_id: karyawan.id,
                        tanggal_lahir: parseDate(personal.tanggal_lahir),
                        tanggal_menikah: parseDate(personal.tanggal_menikah),
                        tanggal_cerai: parseDate(personal.tanggal_cerai),
                        tanggal_wafat_pasangan: parseDate(personal.tanggal_wafat_pasangan),
                    }
                });
            }

            if (hr) {
                await tx.karyawan_hr.create({
                    data: {
                        ...hr,
                        karyawan_id: karyawan.id,
                        jenis_hubungan_kerja_id: hr.jenis_hubungan_kerja_id ? Number(hr.jenis_hubungan_kerja_id) : undefined,
                        kategori_pangkat_id: hr.kategori_pangkat_id ? Number(hr.kategori_pangkat_id) : undefined,
                        golongan_id: hr.golongan_id ? Number(hr.golongan_id) : undefined,
                        sub_golongan_id: hr.sub_golongan_id ? Number(hr.sub_golongan_id) : undefined,
                        lokasi_sebelumnya_id: hr.lokasi_sebelumnya_id ? Number(hr.lokasi_sebelumnya_id) : undefined,
                        tanggal_masuk_group: parseDate(hr.tanggal_masuk_group),
                        tanggal_masuk: parseDate(hr.tanggal_masuk),
                        tanggal_permanent: parseDate(hr.tanggal_permanent),
                        tanggal_kontrak: parseDate(hr.tanggal_kontrak),
                        tanggal_akhir_kontrak: parseDate(hr.tanggal_akhir_kontrak),
                        tanggal_berhenti: parseDate(hr.tanggal_berhenti),
                        tanggal_mutasi: parseDate(hr.tanggal_mutasi),
                    }
                });
            }

            if (keluarga) {
                await tx.karyawan_keluarga.create({
                    data: {
                        ...keluarga,
                        karyawan_id: karyawan.id,
                        tanggal_lahir_pasangan: parseDate(keluarga.tanggal_lahir_pasangan),
                        tanggal_lahir_ayah_mertua: parseDate(keluarga.tanggal_lahir_ayah_mertua),
                        tanggal_lahir_ibu_mertua: parseDate(keluarga.tanggal_lahir_ibu_mertua),
                        anak_ke: keluarga.anak_ke ? Number(keluarga.anak_ke) : null,
                        jumlah_saudara_kandung: keluarga.jumlah_saudara_kandung ? Number(keluarga.jumlah_saudara_kandung) : null,
                    }
                });
            }

            if (anak && Array.isArray(anak)) {
                await tx.karyawan_anak.createMany({
                    data: anak.map((a: any, i: number) => ({
                        ...a,
                        karyawan_id: karyawan.id,
                        urutan: i + 1,
                        tanggal_lahir: parseDate(a.tanggal_lahir)
                    }))
                });
            }

            if (saudara && Array.isArray(saudara)) {
                await tx.karyawan_saudara.createMany({
                    data: saudara.map((s: any, i: number) => ({
                        ...s,
                        karyawan_id: karyawan.id,
                        urutan: i + 1,
                        tanggal_lahir: parseDate(s.tanggal_lahir)
                    }))
                });
            }

            if (tag_ids && Array.isArray(tag_ids)) {
                await tx.karyawan_tag.createMany({
                    data: tag_ids.map((tid: number) => ({ karyawan_id: karyawan.id, tag_id: tid }))
                });
            }

            return tx.karyawan.findUnique({ where: { id: karyawan.id }, include: includeFull });
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat data' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { head, personal, hr, keluarga, anak, saudara, tag_ids } = req.body;
        const karyawanId = Number(id);

        const result = await prisma.$transaction(async (tx) => {
            if (head) {
                await tx.karyawan.update({
                    where: { id: karyawanId },
                    data: {
                        ...head,
                        divisi_id: head.divisi_id ? Number(head.divisi_id) : undefined,
                        department_id: head.department_id ? Number(head.department_id) : undefined,
                        manager_id: head.manager_id === 'null' ? null : (head.manager_id ? Number(head.manager_id) : undefined),
                        atasan_langsung_id: head.atasan_langsung_id === 'null' ? null : (head.atasan_langsung_id ? Number(head.atasan_langsung_id) : undefined),
                        posisi_jabatan_id: head.posisi_jabatan_id ? Number(head.posisi_jabatan_id) : undefined,
                        status_karyawan_id: head.status_karyawan_id ? Number(head.status_karyawan_id) : undefined,
                        lokasi_kerja_id: head.lokasi_kerja_id ? Number(head.lokasi_kerja_id) : undefined,
                    }
                });
            }

            if (personal) {
                const personalData = {
                    ...personal,
                    tanggal_lahir: parseDate(personal.tanggal_lahir),
                    tanggal_menikah: parseDate(personal.tanggal_menikah),
                    tanggal_cerai: parseDate(personal.tanggal_cerai),
                    tanggal_wafat_pasangan: parseDate(personal.tanggal_wafat_pasangan),
                };
                await tx.karyawan_personal.upsert({
                    where: { karyawan_id: karyawanId },
                    create: { ...personalData, karyawan_id: karyawanId },
                    update: personalData
                });
            }

            if (hr) {
                const hrData = {
                    ...hr,
                    jenis_hubungan_kerja_id: hr.jenis_hubungan_kerja_id ? Number(hr.jenis_hubungan_kerja_id) : undefined,
                    kategori_pangkat_id: hr.kategori_pangkat_id ? Number(hr.kategori_pangkat_id) : undefined,
                    golongan_id: hr.golongan_id ? Number(hr.golongan_id) : undefined,
                    sub_golongan_id: hr.sub_golongan_id ? Number(hr.sub_golongan_id) : undefined,
                    lokasi_sebelumnya_id: hr.lokasi_sebelumnya_id ? Number(hr.lokasi_sebelumnya_id) : undefined,
                    tanggal_masuk_group: parseDate(hr.tanggal_masuk_group),
                    tanggal_masuk: parseDate(hr.tanggal_masuk),
                    tanggal_permanent: parseDate(hr.tanggal_permanent),
                    tanggal_kontrak: parseDate(hr.tanggal_kontrak),
                    tanggal_akhir_kontrak: parseDate(hr.tanggal_akhir_kontrak),
                    tanggal_berhenti: parseDate(hr.tanggal_berhenti),
                    tanggal_mutasi: parseDate(hr.tanggal_mutasi),
                };
                await tx.karyawan_hr.upsert({
                    where: { karyawan_id: karyawanId },
                    create: { ...hrData, karyawan_id: karyawanId },
                    update: hrData
                });
            }

            if (keluarga) {
                const keluargaData = {
                    ...keluarga,
                    tanggal_lahir_pasangan: parseDate(keluarga.tanggal_lahir_pasangan),
                    tanggal_lahir_ayah_mertua: parseDate(keluarga.tanggal_lahir_ayah_mertua),
                    tanggal_lahir_ibu_mertua: parseDate(keluarga.tanggal_lahir_ibu_mertua),
                    anak_ke: keluarga.anak_ke ? Number(keluarga.anak_ke) : null,
                    jumlah_saudara_kandung: keluarga.jumlah_saudara_kandung ? Number(keluarga.jumlah_saudara_kandung) : null,
                };
                await tx.karyawan_keluarga.upsert({
                    where: { karyawan_id: karyawanId },
                    create: { ...keluargaData, karyawan_id: karyawanId },
                    update: keluargaData
                });
            }

            if (anak && Array.isArray(anak)) {
                await tx.karyawan_anak.deleteMany({ where: { karyawan_id: karyawanId } });
                await tx.karyawan_anak.createMany({
                    data: anak.map((a: any, i: number) => ({
                        ...a,
                        karyawan_id: karyawanId,
                        urutan: i + 1,
                        tanggal_lahir: parseDate(a.tanggal_lahir)
                    }))
                });
            }

            if (saudara && Array.isArray(saudara)) {
                await tx.karyawan_saudara.deleteMany({ where: { karyawan_id: karyawanId } });
                await tx.karyawan_saudara.createMany({
                    data: saudara.map((s: any, i: number) => ({
                        ...s,
                        karyawan_id: karyawanId,
                        urutan: i + 1,
                        tanggal_lahir: parseDate(s.tanggal_lahir)
                    }))
                });
            }

            if (tag_ids && Array.isArray(tag_ids)) {
                await tx.karyawan_tag.deleteMany({ where: { karyawan_id: karyawanId } });
                await tx.karyawan_tag.createMany({
                    data: tag_ids.map((tid: number) => ({ karyawan_id: karyawanId, tag_id: tid }))
                });
            }

            return tx.karyawan.findUnique({ where: { id: karyawanId }, include: includeFull });
        });

        return res.json(result);
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ message: 'Data tidak ditemukan' });
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data' });
    }
};

export const uploadFoto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diunggah' });

        const karyawan = await prisma.karyawan.findUnique({ where: { id: Number(id) } });
        if (!karyawan) return res.status(404).json({ message: 'Data tidak ditemukan' });

        // Hapus foto lama jika ada
        if (karyawan.foto_karyawan) {
            const oldPath = path.resolve(karyawan.foto_karyawan);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const updated = await prisma.karyawan.update({
            where: { id: Number(id) },
            data: { foto_karyawan: req.file.path }
        });

        return res.json({ foto_url: updated.foto_karyawan });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengunggah foto' });
    }
};

export const downloadTemplate = async (_req: Request, res: Response) => {
    try {
        // Resolve from project root or backend folder
        let templatePath = path.resolve(process.cwd(), 'backend/templates/BMI-kosong.xlsx');
        if (!fs.existsSync(templatePath)) {
            templatePath = path.resolve(process.cwd(), 'templates/BMI-kosong.xlsx');
        }
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ message: 'Template tidak ditemukan' });
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template-import-karyawan.xlsx');
        return res.sendFile(templatePath);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengunduh template' });
    }
};

export const getQrCode = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const karyawan = await prisma.karyawan.findUnique({ where: { id: Number(id) } });
        if (!karyawan) return res.status(404).json({ message: 'Data tidak ditemukan' });

        const buffer = await QRCode.toBuffer(karyawan.nomor_induk_karyawan, { type: 'png' });
        res.setHeader('Content-Type', 'image/png');
        return res.send(buffer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat QR code' });
    }
};

export const exportExcel = async (req: Request, res: Response) => {
    try {
        const { search, divisi_id, department_id, status_karyawan_id, lokasi_kerja_id, template } = req.query;

        let data: any[] = [];
        if (template !== 'true') {
            const where: any = {};
            if (search) {
                where.OR = [
                    { nama_lengkap: { contains: String(search), mode: 'insensitive' } },
                    { nomor_induk_karyawan: { contains: String(search), mode: 'insensitive' } }
                ];
            }
            if (divisi_id) where.divisi_id = Number(divisi_id);
            if (department_id) where.department_id = Number(department_id);
            if (status_karyawan_id) where.status_karyawan_id = Number(status_karyawan_id);
            if (lokasi_kerja_id) where.lokasi_kerja_id = Number(lokasi_kerja_id);

            data = await prisma.karyawan.findMany({
                where,
                include: includeFull,
                orderBy: { nama_lengkap: 'asc' }
            });
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Data Karyawan');

        sheet.addRow(buildExportHeaders());
        data.forEach((k) => {
            sheet.addRow(buildExportRow(k));
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=data-karyawan.xlsx');

        await workbook.xlsx.write(res);
        return res.end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat ekspor data' });
    }
};

export const importExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        if (!req.file.buffer) return res.status(400).json({ message: 'File buffer tidak ditemukan' });

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer as any);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) return res.status(400).json({ message: 'Sheet tidak ditemukan' });

        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell) => headers.push(String(cell.value)));

        // Cache Master Data untu resolusi nama ke ID
        const [divisi, dept, jhk, kpk, gol, sgol, lok, stk, tags] = await Promise.all([
            prisma.divisi.findMany({ where: { status: 'Aktif' } }),
            prisma.department.findMany({ where: { status: 'Aktif' } }),
            prisma.jenis_hubungan_kerja.findMany({ where: { status: 'Aktif' } }),
            prisma.kategori_pangkat.findMany({ where: { status: 'Aktif' } }),
            prisma.golongan.findMany({ where: { status: 'Aktif' } }),
            prisma.sub_golongan.findMany({ where: { status: 'Aktif' } }),
            prisma.lokasi_kerja.findMany({ where: { status: 'Aktif' } }),
            prisma.status_karyawan.findMany({ where: { status: 'Aktif' } }),
            prisma.tag.findMany({ where: { status: 'Aktif' } })
        ]);

        const findId = (list: any[], name: string) => list.find(i => i.nama.toLowerCase() === name.toLowerCase())?.id;

        const results = { berhasil: 0, gagal: 0, errors: [] as any[] };

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const namaLengkap = row.getCell(headers.indexOf("NAMA LENGKAP") + 1).value;
            if (!namaLengkap) continue; // Skip if Name is empty

            try {
                const parsed = parseImportRow(row, headers);

                // Validate NIK
                if (!parsed.head.nomor_induk_karyawan) {
                    throw new Error(`Baris ${rowNumber}: Nomor Induk Karyawan (NIK) tidak boleh kosong`);
                }

                // Resolve IDs (Master Data)
                const divisi_id = findId(divisi, parsed.head.divisi_nama);
                const department_id = findId(dept, parsed.head.department_nama);
                const status_karyawan_id = findId(stk, parsed.head.status_karyawan_nama);
                const lokasi_kerja_id = findId(lok, parsed.head.lokasi_kerja_nama);

                // Resolve Posisi Jabatan (if column exists, usually mapped to ORGANISSASI SUB DEPARTMENT in excel)
                const posisi_jabatan_nama = String(row.getCell(headers.indexOf("ORGANISSASI SUB DEPARTMENT") + 1).value || '');
                const posisi_jabatan_id = (posisi_jabatan_nama && department_id) ? await (async () => {
                    const pj = await prisma.posisi_jabatan.findFirst({
                        where: { nama: { equals: posisi_jabatan_nama, mode: 'insensitive' }, department_id }
                    });
                    return pj?.id;
                })() : undefined;

                // Resolve Manager & Atasan by NIK
                const manager = parsed.head.manager_nik ? await prisma.karyawan.findUnique({
                    where: { nomor_induk_karyawan: parsed.head.manager_nik }
                }) : null;
                const atasan = parsed.head.atasan_nik ? await prisma.karyawan.findUnique({
                    where: { nomor_induk_karyawan: parsed.head.atasan_nik }
                }) : null;

                const mappedHead = {
                    ...parsed.head,
                    divisi_id,
                    department_id,
                    status_karyawan_id,
                    lokasi_kerja_id,
                    posisi_jabatan_id,
                    manager_id: manager?.id,
                    atasan_langsung_id: atasan?.id
                };
                // Remove helper fields
                delete (mappedHead as any).divisi_nama;
                delete (mappedHead as any).department_nama;
                delete (mappedHead as any).status_karyawan_nama;
                delete (mappedHead as any).lokasi_kerja_nama;
                delete (mappedHead as any).tag_nama;
                delete (mappedHead as any).manager_nik;
                delete (mappedHead as any).atasan_nik;
                delete (mappedHead as any).posisi_jabatan_nama;
                delete (mappedHead as any).foto_karyawan; // Do not import photos from excel for now

                const mappedHr = {
                    ...parsed.hr,
                    jenis_hubungan_kerja_id: findId(jhk, parsed.hr.jenis_hubungan_kerja_nama),
                    kategori_pangkat_id: findId(kpk, parsed.hr.kategori_pangkat_nama),
                    golongan_id: findId(gol, parsed.hr.golongan_nama),
                    sub_golongan_id: findId(sgol, parsed.hr.sub_golongan_nama),
                    lokasi_sebelumnya_id: findId(lok, parsed.hr.lokasi_sebelumnya_nama)
                };
                delete (mappedHr as any).jenis_hubungan_kerja_nama;
                delete (mappedHr as any).kategori_pangkat_nama;
                delete (mappedHr as any).golongan_nama;
                delete (mappedHr as any).sub_golongan_nama;
                delete (mappedHr as any).lokasi_sebelumnya_nama;

                await prisma.$transaction(async (tx) => {
                    const existing = await tx.karyawan.findUnique({
                        where: { nomor_induk_karyawan: mappedHead.nomor_induk_karyawan }
                    });

                    let karyawan;
                    if (existing) {
                        karyawan = await tx.karyawan.update({
                            where: { id: existing.id },
                            data: mappedHead
                        });
                    } else {
                        karyawan = await tx.karyawan.create({
                            data: mappedHead
                        });
                    }

                    await tx.karyawan_personal.upsert({
                        where: { karyawan_id: karyawan.id },
                        create: { ...parsed.personal, karyawan_id: karyawan.id },
                        update: parsed.personal
                    });

                    await tx.karyawan_hr.upsert({
                        where: { karyawan_id: karyawan.id },
                        create: { ...mappedHr, karyawan_id: karyawan.id },
                        update: mappedHr
                    });

                    await tx.karyawan_keluarga.upsert({
                        where: { karyawan_id: karyawan.id },
                        create: { ...parsed.keluarga, karyawan_id: karyawan.id },
                        update: parsed.keluarga
                    });

                    // Anak & Saudara (Sync)
                    await tx.karyawan_anak.deleteMany({ where: { karyawan_id: karyawan.id } });
                    if (parsed.anak.length > 0) {
                        await tx.karyawan_anak.createMany({
                            data: parsed.anak.map((a: any) => ({ ...a, karyawan_id: karyawan.id }))
                        });
                    }

                    await tx.karyawan_saudara.deleteMany({ where: { karyawan_id: karyawan.id } });
                    if (parsed.saudara.length > 0) {
                        await tx.karyawan_saudara.createMany({
                            data: parsed.saudara.map((s: any) => ({ ...s, karyawan_id: karyawan.id }))
                        });
                    }

                    // Sync Tag
                    await tx.karyawan_tag.deleteMany({ where: { karyawan_id: karyawan.id } });
                    const tagId = findId(tags, parsed.head.tag_nama);
                    if (tagId) {
                        await tx.karyawan_tag.create({
                            data: { karyawan_id: karyawan.id, tag_id: tagId }
                        });
                    }
                });

                results.berhasil++;
            } catch (e: any) {
                results.gagal++;
                results.errors.push({ baris: rowNumber, pesan: e.message });
            }
        }

        return res.json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat impor data' });
    }
};

export const previewImport = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        if (!req.file.buffer) return res.status(400).json({ message: 'File buffer tidak ditemukan' });

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer as any);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) return res.status(400).json({ message: 'Sheet tidak ditemukan' });

        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell) => headers.push(String(cell.value)));

        const rows: any[] = [];
        let total = 0;
        let valid = 0;
        let invalid = 0;

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const namaLengkapCell = row.getCell(headers.indexOf("NAMA LENGKAP") + 1).value;
            if (!namaLengkapCell) continue; // Skip empty row

            total++;
            try {
                const parsed = parseImportRow(row, headers);

                // Light validation
                if (!parsed.head.nomor_induk_karyawan) {
                    throw new Error("NIK wajib ada");
                }
                if (!parsed.head.nama_lengkap) {
                    throw new Error("Nama lengkap wajib ada");
                }

                rows.push({
                    baris: rowNumber,
                    nama_lengkap: parsed.head.nama_lengkap,
                    nomor_induk_karyawan: parsed.head.nomor_induk_karyawan,
                    divisi: parsed.head.divisi_nama,
                    department: parsed.head.department_nama,
                    status_karyawan: parsed.head.status_karyawan_nama,
                    status: "valid",
                    pesan: ""
                });
                valid++;
            } catch (e: any) {
                invalid++;
                rows.push({
                    baris: rowNumber,
                    nama_lengkap: String(row.getCell(headers.indexOf("NAMA LENGKAP") + 1).value || ''),
                    nomor_induk_karyawan: String(row.getCell(headers.indexOf("NOMOR INDUK KARYAWAN") + 1).value || ''),
                    divisi: String(row.getCell(headers.indexOf("DIVISI") + 1).value || ''),
                    department: String(row.getCell(headers.indexOf("DEPARTMENT") + 1).value || ''),
                    status_karyawan: String(row.getCell(headers.indexOf("STATUS KARYAWAN") + 1).value || ''),
                    status: "error",
                    pesan: e.message
                });
            }
        }

        return res.json({ total, valid, invalid, rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat memproses pratinjau' });
    }
};

export const uploadDokumen = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama_dokumen } = req.body;

        if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        if (!nama_dokumen) return res.status(400).json({ message: 'Nama dokumen wajib diisi' });

        const karyawan = await prisma.karyawan.findUnique({ where: { id: Number(id) } });
        if (!karyawan) return res.status(404).json({ message: 'Data tidak ditemukan' });

        const dokumen = await prisma.karyawan_dokumen.create({
            data: {
                karyawan_id: Number(id),
                nama_dokumen,
                file_path: req.file.path,
                file_type: req.file.mimetype,
                file_size: req.file.size
            }
        });

        return res.status(201).json(dokumen);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengunggah dokumen' });
    }
};

export const deleteDokumen = async (req: Request, res: Response) => {
    try {
        const { docId } = req.params;

        const dokumen = await prisma.karyawan_dokumen.findUnique({ where: { id: Number(docId) } });
        if (!dokumen) return res.status(404).json({ message: 'Dokumen tidak ditemukan' });

        // Hapus file fisik
        const filePath = path.resolve(dokumen.file_path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await prisma.karyawan_dokumen.delete({ where: { id: Number(docId) } });

        return res.json({ message: 'Dokumen berhasil dihapus' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menghapus dokumen' });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const next60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
        const currentMonth = today.getMonth() + 1;

        const totalKaryawan = await prisma.karyawan.count();
        const activeKaryawan = await prisma.karyawan.count({
            where: { status_karyawan: { status: 'Aktif' } }
        });

        // Karyawan Baru Bulan Ini
        const newKaryawanThisMonth = await prisma.karyawan.count({
            where: { created_at: { gte: startOfMonth } }
        });

        // Onboarding & Offboarding
        const onboardingCount = await prisma.karyawan.count({
            where: { status_proses: 'Onboarding' }
        });
        const offboardingCount = await prisma.karyawan.count({
            where: { status_proses: 'Offboarding' }
        });

        // Stats per Divisi
        const karyawanPerDivisi = await prisma.divisi.findMany({
            select: {
                nama: true,
                _count: {
                    select: { karyawan: true }
                }
            }
        });

        // Gender Stats
        const genderStatsRaw = await prisma.karyawan_personal.groupBy({
            by: ['jenis_kelamin'],
            _count: { jenis_kelamin: true }
        });

        // Employment Status Stats
        const employmentStatsRaw = await prisma.karyawan_hr.findMany({
            select: {
                jenis_hubungan_kerja: {
                    select: { nama: true }
                }
            }
        });

        const employmentStatsMap: Record<string, number> = {};
        employmentStatsRaw.forEach(hr => {
            const name = hr.jenis_hubungan_kerja?.nama || 'Unknown';
            employmentStatsMap[name] = (employmentStatsMap[name] || 0) + 1;
        });

        // Recent Joined
        const recentKaryawan = await prisma.karyawan.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                nama_lengkap: true,
                nomor_induk_karyawan: true,
                created_at: true,
                posisi_jabatan: { select: { nama: true } }
            }
        });

        // Upcoming Birthdays (Bulan ini)
        const allPersonal = await prisma.karyawan_personal.findMany({
            where: {
                tanggal_lahir: { not: null }
            },
            select: {
                karyawan: {
                    select: {
                        id: true,
                        nama_lengkap: true,
                        foto_karyawan: true
                    }
                },
                tanggal_lahir: true
            }
        });

        const upcomingBirthdays = allPersonal
            .filter(p => p.tanggal_lahir && new Date(p.tanggal_lahir).getMonth() + 1 === currentMonth)
            .map(p => ({
                id: p.karyawan.id,
                nama: p.karyawan.nama_lengkap,
                foto: p.karyawan.foto_karyawan,
                tanggal: p.tanggal_lahir
            }))
            .sort((a, b) => new Date(a.tanggal!).getDate() - new Date(b.tanggal!).getDate())
            .slice(0, 5);

        // Expiring Contracts (60 hari kedepan)
        const expiringContracts = await prisma.karyawan_hr.findMany({
            where: {
                tanggal_akhir_kontrak: {
                    gte: today,
                    lte: next60Days
                }
            },
            take: 5,
            orderBy: { tanggal_akhir_kontrak: 'asc' },
            select: {
                karyawan: {
                    select: {
                        id: true,
                        nama_lengkap: true,
                        nomor_induk_karyawan: true
                    }
                },
                tanggal_akhir_kontrak: true
            }
        });

        return res.json({
            totalKaryawan,
            activeKaryawan,
            newKaryawanThisMonth,
            onboardingCount,
            offboardingCount,
            karyawanPerDivisi: karyawanPerDivisi.map(d => ({
                nama: d.nama,
                jumlah: d._count.karyawan
            })),
            genderStats: genderStatsRaw.map(g => ({
                gender: g.jenis_kelamin || 'Tidak Diisi',
                count: g._count.jenis_kelamin
            })),
            employmentStats: Object.entries(employmentStatsMap).map(([nama, jumlah]) => ({
                nama,
                jumlah
            })),
            recentKaryawan,
            upcomingBirthdays,
            expiringContracts: expiringContracts.map(c => ({
                id: c.karyawan.id,
                nama: c.karyawan.nama_lengkap,
                nik: c.karyawan.nomor_induk_karyawan,
                tanggal_berakhir: c.tanggal_akhir_kontrak
            }))
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil statistik dashboard' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const karyawanId = Number(id);

        const karyawan = await prisma.karyawan.findUnique({
            where: { id: karyawanId },
            include: { dokumen: true }
        });

        if (!karyawan) return res.status(404).json({ message: 'Data tidak ditemukan' });

        await prisma.$transaction(async (tx) => {
            // 1. Hapus file dokumen secara fisik
            for (const doc of karyawan.dokumen) {
                const docPath = path.resolve(doc.file_path);
                if (fs.existsSync(docPath)) {
                    try {
                        fs.unlinkSync(docPath);
                    } catch (err) {
                        console.error(`Gagal menghapus file dokumen: ${docPath}`, err);
                    }
                }
            }

            // 2. Hapus foto profil secara fisik
            if (karyawan.foto_karyawan) {
                const fotoPath = path.resolve(karyawan.foto_karyawan);
                if (fs.existsSync(fotoPath)) {
                    try {
                        fs.unlinkSync(fotoPath);
                    } catch (err) {
                        console.error(`Gagal menghapus file foto: ${fotoPath}`, err);
                    }
                }
            }

            // 3. Hapus Akun User terkait
            await tx.users.deleteMany({ where: { karyawan_id: karyawanId } });

            // 4. Lepas jabatan manager di department jika ada
            await tx.department.updateMany({
                where: { manager_id: karyawanId },
                data: { manager_id: null }
            });

            // 5. Hapus Tag Karyawan
            await tx.karyawan_tag.deleteMany({ where: { karyawan_id: karyawanId } });

            // 6. Hapus Record Utama (Trigger Cascade Delete untuk Personal, HR, Keluarga, Anak, Saudara)
            await tx.karyawan.delete({ where: { id: karyawanId } });
        });

        return res.json({ message: 'Karyawan berhasil dihapus' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menghapus data karyawan' });
    }
};
