/**
 * Menghasilkan singkatan dari nama (huruf pertama setiap kata)
 */
export const generateCode = (prefix: string, nama: string): string => {
    const abbreviation = nama
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase())
        .join('');

    const finalAbbreviation = abbreviation || Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${finalAbbreviation}`;
};

/**
 * Memastikan code unik dengan menambahkan suffix angka jika perlu
 */
export const ensureUniqueCode = async (
    baseCode: string,
    checkFn: (_s: string) => Promise<boolean>
): Promise<string> => {
    let code = baseCode;
    let counter = 2;

    while (!(await checkFn(code))) {
        code = `${baseCode}-${counter}`;
        counter++;
    }

    return code;
};
