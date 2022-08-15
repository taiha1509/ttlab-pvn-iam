import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Column, Entity } from 'typeorm';
import { IPermissionAction, IPermissionResource } from '../role.type';
import { RolePermission } from './rolePermissionsRelation.entity';

@Entity({ name: 'permissions' })
export class Permission extends BaseEntity {
    @Column({ type: 'int', nullable: false })
    actionId: number;

    @Column({ type: 'int', nullable: false })
    resourceId: number;

    rolePermissions?: RolePermission[];
    action?: IPermissionAction;
    resource?: IPermissionResource;
}
