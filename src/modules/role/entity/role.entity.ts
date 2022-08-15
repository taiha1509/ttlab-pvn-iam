import { Entity, Column } from 'typeorm';
import {
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Permission } from './permission.entity';
import { RolePermission } from './rolePermissionsRelation.entity';
import { UserRole } from './userRolesRelation.entity';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
    @Column({ type: 'varchar', length: INPUT_TEXT_MAX_LENGTH })
    name: string;

    permissions: Permission[];

    rolePermissions: RolePermission[];
    userRoles: UserRole[];

    @Column({ type: 'varchar', length: TEXTAREA_MAX_LENGTH })
    description: string;
}
