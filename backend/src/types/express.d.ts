export { };

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                nik: string;
                nama: string;
                role: string;
            };
        }
    }
}
