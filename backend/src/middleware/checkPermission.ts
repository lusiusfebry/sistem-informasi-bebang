import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkPermission = (module: string, action: string, feature?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            // Fetch user roles and their permissions
            const userWithRoles = await prisma.users.findUnique({
                where: { id: user.id },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!userWithRoles) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
            }

            // Check if any role has the required permission
            const hasPermission = userWithRoles.roles.some(ur =>
                ur.role.permissions.some(rp => {
                    const p = rp.permission;
                    const matchModule = p.module === module;
                    const matchAction = p.action === action || p.action === 'Manage'; // 'Manage' implies all actions
                    const matchFeature = feature ? p.feature === feature : true;

                    return matchModule && matchAction && matchFeature && p.status === 'Aktif';
                })
            );

            if (!hasPermission) {
                // Log failed access attempt
                await prisma.security_audit_log.create({
                    data: {
                        user_id: user.id,
                        action: 'ACCESS_DENIED',
                        resource: `${module}:${feature || ''}:${action}`,
                        details: {
                            reason: 'Permission missing or role inactive'
                        }
                    }
                });

                return res.status(403).json({
                    message: 'Anda tidak memiliki hak akses untuk melakukan tindakan ini',
                    required: { module, action, feature }
                });
            }

            next();
        } catch (error) {
            console.error('Check permission error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat memverifikasi hak akses' });
        }
    };
};
