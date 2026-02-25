import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGuardProps {
    module: string;
    action: string;
    feature?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    module,
    action,
    feature,
    fallback = null,
    children
}) => {
    const { hasPermission } = useAuth();

    if (hasPermission(module, action, feature)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
