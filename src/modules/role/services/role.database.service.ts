import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { appendPermissionToRole } from 'src/common/helpers/commonFunctions';
import { EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { CreateRoleDto } from '../dto/request/createDto';
import { UpdateRoleDto } from '../dto/request/updateDto';
import { Role } from '../entity/role.entity';
import { RolePermission } from '../entity/rolePermissionsRelation.entity';
import { UserRole } from '../entity/userRolesRelation.entity';
import { roleAttributesList } from '../role.constants';

@Injectable()
export class RoleService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {}

    async createRole(data: CreateRoleDto) {
        let roleId = undefined;
        await this.entityManager.transaction(async (entityManager) => {
            // insert to roles table
            const insertedRole = await entityManager
                .getRepository(Role)
                .insert({
                    name: data.name,
                    createdBy: data.createdBy,
                    description: data.description,
                });
            roleId = insertedRole.identifiers[0].id;

            // insert into role_permissions table
            const rolePermissionRecords = data.permissionIds.map(
                (permissionId) => ({
                    roleId,
                    permissionId: permissionId,
                    createdBy: data.createdBy,
                }),
            );
            await entityManager
                .getRepository(RolePermission)
                .save([...rolePermissionRecords]);
        });
        return await this.getRole(roleId);
    }

    private getRoleQueryBuilder(
        attributesList: string[],
    ): SelectQueryBuilder<Role> {
        return this.entityManager
            .createQueryBuilder(Role, 'role')
            .leftJoinAndMapMany(
                'role.rolePermissions',
                RolePermission,
                'rolePermission',
                'rolePermission.roleId = role.id',
            )
            .select(attributesList);
    }

    async getRoleList() {
        const roles = await this.getRoleQueryBuilder(
            roleAttributesList,
        ).getMany();
        roles.forEach((role) => {
            appendPermissionToRole(role);
        });
        return roles;
    }

    async getRoleListByIds(ids: number[]) {
        const roles = await this.entityManager.getRepository(Role).find({
            where: {
                id: In(ids),
            },
            select: ['id', 'name', 'description'],
        });
        return roles;
    }

    async getUserRoleByUserIds(userIds: number[]) {
        return await this.entityManager.getRepository(UserRole).find({
            where: {
                userId: In(userIds),
            },
            select: ['id', 'roleId', 'userId'],
        });
    }

    async getRole(id: number) {
        const role = await this.getRoleQueryBuilder(roleAttributesList)
            .where('role.id = :id', { id })
            .getOne();
        if (!role) {
            return undefined;
        }
        appendPermissionToRole(role);

        return role;
    }

    async updateRole(id: number, data: UpdateRoleDto) {
        await this.entityManager.transaction(async (entityManager) => {
            await Promise.all([
                // soft delete all role_permissions records by roleId
                entityManager.getRepository(RolePermission).update(
                    {
                        roleId: id,
                    },
                    {
                        deletedAt: new Date(),
                        deletedBy: data.deletedBy,
                    },
                ),
                // update roles table
                entityManager.getRepository(Role).update(
                    {
                        id,
                    },
                    {
                        name: data.name,
                        description: data.description,
                        updatedBy: data.updatedBy,
                    },
                ),
            ]);
            // insert new role_permission records
            const rolePermissionRecords = data.permissionIds.map((item) => ({
                permissionId: item,
                roleId: id,
            }));
            await entityManager
                .getRepository(RolePermission)
                .insert([...rolePermissionRecords]);
        });

        return await this.getRole(id);
    }

    async deleteRole(id: number, userId: number) {
        const roleRecord = await this.entityManager
            .getRepository(Role)
            .findOne(id);
        await this.entityManager.getRepository(Role).save({
            ...roleRecord,
            deletedAt: new Date(),
            deletedBy: userId,
        });
    }

    async canDeleteRole(id: number): Promise<boolean> {
        return (
            (await this.entityManager
                .getRepository(UserRole)
                .count({ where: { roleId: id } })) > 0
        );
    }
}
