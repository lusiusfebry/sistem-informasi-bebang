
const ExcelJS = require('exceljs');
const path = require('path');

async function createTestFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Exact headers from parseImportRow
    const headers = ["NO", "NAMA LENGKAP", "NOMOR INDUK KARYAWAN", "DIVISI", "DEPARTMENT", "STATUS KARYAWAN"];
    worksheet.addRow(headers);

    // Dummy row
    worksheet.addRow([1, "TEST USER", "00-00002", "IT", "TECH", "KONTRAK"]);

    const filePath = path.resolve('test-import.xlsx');
    await workbook.xlsx.writeFile(filePath);
    console.log('Created test file:', filePath);
}

createTestFile().catch(console.error);
