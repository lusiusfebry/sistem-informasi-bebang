import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import { parseImportRow, buildExportHeaders, buildExportRow } from '../utils/excelMapper';

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
    atasan_langsung: true
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
                    manager_id: head.manager_id ? Number(head.manager_id) : undefined,
                    atasan_langsung_id: head.atasan_langsung_id ? Number(head.atasan_langsung_id) : undefined,
                    posisi_jabatan_id: head.posisi_jabatan_id ? Number(head.posisi_jabatan_id) : undefined,
                    status_karyawan_id: head.status_karyawan_id ? Number(head.status_karyawan_id) : undefined,
                    lokasi_kerja_id: head.lokasi_kerja_id ? Number(head.lokasi_kerja_id) : undefined,
                }
            });

            if (personal) {
                await tx.karyawan_personal.create({
                    data: { ...personal, karyawan_id: karyawan.id }
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
                    }
                });
            }

            if (keluarga) {
                await tx.karyawan_keluarga.create({
                    data: { ...keluarga, karyawan_id: karyawan.id }
                });
            }

            if (anak && Array.isArray(anak)) {
                await tx.karyawan_anak.createMany({
                    data: anak.map((a: any, i: number) => ({ ...a, karyawan_id: karyawan.id, urutan: i + 1 }))
                });
            }

            if (saudara && Array.isArray(saudara)) {
                await tx.karyawan_saudara.createMany({
                    data: saudara.map((s: any, i: number) => ({ ...s, karyawan_id: karyawan.id, urutan: i + 1 }))
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
                        manager_id: head.manager_id ? Number(head.manager_id) : undefined,
                        atasan_langsung_id: head.atasan_langsung_id ? Number(head.atasan_langsung_id) : undefined,
                        posisi_jabatan_id: head.posisi_jabatan_id ? Number(head.posisi_jabatan_id) : undefined,
                        status_karyawan_id: head.status_karyawan_id ? Number(head.status_karyawan_id) : undefined,
                        lokasi_kerja_id: head.lokasi_kerja_id ? Number(head.lokasi_kerja_id) : undefined,
                    }
                });
            }

            if (personal) {
                await tx.karyawan_personal.upsert({
                    where: { karyawan_id: karyawanId },
                    create: { ...personal, karyawan_id: karyawanId },
                    update: personal
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
                };
                await tx.karyawan_hr.upsert({
                    where: { karyawan_id: karyawanId },
                    create: { ...hrData, karyawan_id: karyawanId },
                    update: hrData
                });
            }

            if (keluarga) {
                await tx.karyawan_keluarga.upsert({
                    where: { karyawan_id: karyawanId },
                    create: { ...keluarga, karyawan_id: karyawanId },
                    update: keluarga
                });
            }

            if (anak && Array.isArray(anak)) {
                await tx.karyawan_anak.deleteMany({ where: { karyawan_id: karyawanId } });
                await tx.karyawan_anak.createMany({
                    data: anak.map((a: any, i: number) => ({ ...a, karyawan_id: karyawanId, urutan: i + 1 }))
                });
            }

            if (saudara && Array.isArray(saudara)) {
                await tx.karyawan_saudara.deleteMany({ where: { karyawan_id: karyawanId } });
                await tx.karyawan_saudara.createMany({
                    data: saudara.map((s: any, i: number) => ({ ...s, karyawan_id: karyawanId, urutan: i + 1 }))
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
        const { search, divisi_id, department_id, status_karyawan_id, lokasi_kerja_id } = req.query;

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

        const data = await prisma.karyawan.findMany({
            where,
            include: includeFull,
            orderBy: { nama_lengkap: 'asc' }
        });

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
