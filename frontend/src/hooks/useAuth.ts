import { useMemo } from 'react';

export interface UserPermission {
    module: string;
    feature: string | null;
    action: string;
}

export interface User {
    id: number;
    nik: string;
    nama: string;
    roles: string[];
    permissions: UserPermission[];
}

export const useAuth = () => {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    const user = useMemo(() => {
        if (!userJson) return null;
        try {
            return JSON.parse(userJson) as User;
        } catch (e) {
            console.error('Failed to parse user data', e);
            return null;
        }
    }, [userJson]);

    const hasPermission = (module: string, action: string, feature?: string) => {
        if (!user) return false;

        // Super admin check (if role name is 'Super Admin')
        if (user.roles.some(r => r === 'Super Admin' || r === 'Administrator')) return true;

        return user.permissions.some(p =>
            p.module === module &&
            p.action === action &&
            (!feature || p.feature === feature)
        );
    };

    const hasAnyPermission = (permissions: { module: string, action: string, feature?: string }[]) => {
        return permissions.some(p => hasPermission(p.module, p.action, p.feature));
    };

    return {
        user,
        isAuthenticated: !!user,
        hasPermission,
        hasAnyPermission
    };
};
