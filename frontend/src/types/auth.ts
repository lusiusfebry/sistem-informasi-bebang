export interface LoginRequest {
    nik: string;
    password: string;
}

export interface AuthUser {
    id: number;
    nik: string;
    nama: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}
