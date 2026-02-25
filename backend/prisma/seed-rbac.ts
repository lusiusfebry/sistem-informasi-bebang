import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seed RBAC V2 start...');

    // 1. Create Permission Groups
    const groups = [
        { nama: 'Human Resources', deskripsi: 'Manajemen data karyawan dan struktur organisasi' },
        { nama: 'Mess Management', deskripsi: 'Pengelolaan mess, kamar, dan fasilitas' },
        { nama: 'Access Control', deskripsi: 'Pengaturan hak akses, role, dan audit' },
        { nama: 'General', deskripsi: 'Akses umum aplikasi' }
    ];

    for (const group of groups) {
        await prisma.permission_group.upsert({
            where: { nama: group.nama },
            update: group,
            create: group
        });
    }

    const hrGroup = await prisma.permission_group.findUnique({ where: { nama: 'Human Resources' } });
    const messGroup = await prisma.permission_group.findUnique({ where: { nama: 'Mess Management' } });
    const accessGroup = await prisma.permission_group.findUnique({ where: { nama: 'Access Control' } });

    // 2. Create Permissions
    const permissions = [
        // HR Permissions
        { module: 'HR', feature: 'Employee', action: 'Read', group_id: hrGroup?.id },
        { module: 'HR', feature: 'Employee', action: 'Create', group_id: hrGroup?.id },
        { module: 'HR', feature: 'Employee', action: 'Update', group_id: hrGroup?.id },
        { module: 'HR', feature: 'Employee', action: 'Delete', group_id: hrGroup?.id },
        { module: 'HR', feature: 'Department', action: 'Manage', group_id: hrGroup?.id },

        // Mess Permissions
        { module: 'Mess', feature: 'Room', action: 'Read', group_id: messGroup?.id },
        { module: 'Mess', feature: 'Room', action: 'Update', group_id: messGroup?.id },
        { module: 'Mess', feature: 'Assignment', action: 'Manage', group_id: messGroup?.id },

        // Access Permissions
        { module: 'System', feature: 'Role', action: 'Manage', group_id: accessGroup?.id },
        { module: 'System', feature: 'User', action: 'Manage', group_id: accessGroup?.id },
        { module: 'System', feature: 'Audit', action: 'Read', group_id: accessGroup?.id },
    ];

    for (const p of permissions) {
        const existingPermission = await prisma.permissions.findFirst({
            where: {
                module: p.module,
                feature: p.feature || null,
                action: p.action,
                field: null
            }
        });

        if (existingPermission) {
            await prisma.permissions.update({
                where: { id: existingPermission.id },
                data: { ...p, feature: p.feature || null, field: null }
            });
        } else {
            await prisma.permissions.create({
                data: { ...p, feature: p.feature || null, field: null }
            });
        }
    }

    // 3. Create Roles
    const roles = [
        { nama: 'Super Admin', deskripsi: 'Akses penuh ke seluruh sistem' },
        { nama: 'HR Admin', deskripsi: 'Manajemen modul HR dan Mess' },
        { nama: 'Staff', deskripsi: 'Akses operasional dasar' }
    ];

    for (const role of roles) {
        await prisma.roles.upsert({
            where: { nama: role.nama },
            update: role,
            create: role
        });
    }

    const superAdminRole = await prisma.roles.findUnique({ where: { nama: 'Super Admin' } });

    // 4. Assign all permissions to Super Admin
    if (superAdminRole) {
        const allPermissions = await prisma.permissions.findMany();
        for (const p of allPermissions) {
            await prisma.role_permissions.upsert({
                where: {
                    role_id_permission_id: {
                        role_id: superAdminRole.id,
                        permission_id: p.id
                    }
                },
                update: {},
                create: {
                    role_id: superAdminRole.id,
                    permission_id: p.id
                }
            });
        }
    }

    // 5. Connect existing admin user to Super Admin role
    const adminUser = await prisma.users.findUnique({ where: { nik: 'admin' } });
    if (adminUser && superAdminRole) {
        await prisma.user_roles.upsert({
            where: {
                user_id_role_id: {
                    user_id: adminUser.id,
                    role_id: superAdminRole.id
                }
            },
            update: {},
            create: {
                user_id: adminUser.id,
                role_id: superAdminRole.id
            }
        });
    }

    console.log('Seed RBAC V2 completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
