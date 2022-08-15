import * as bcrypt from 'bcrypt';
import {
    actionList,
    permissionList,
    resourceList,
} from 'src/modules/common/services/global-data.service';
import { Permission } from 'src/modules/role/entity/permission.entity';
import { Role } from 'src/modules/role/entity/role.entity';
import {
    IPermissionAction,
    IPermissionResource,
} from 'src/modules/role/role.type';

export function extractToken(authorization = '') {
    if (/^Bearer /.test(authorization)) {
        return authorization.substr(7, authorization.length);
    }
    return '';
}

export function hashPassword(passwordRaw: string): string {
    if (!passwordRaw) return '';
    return bcrypt.hashSync(passwordRaw, bcrypt.genSaltSync(10));
}

/**
 * remove accents and return it
 * example 'Nguyễn' => 'Nguyen'
 * @param str string
 * @returns string
 */
export function removeAccents(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

/**
 * check if str includes keyword ignore case sensitive and accents
 * example 'Nguyễn' includes 'uyen'
 * @param str string
 * @param keyword string
 * @returns boolean
 */
export function vietnameseStringInclude(str: string, keyword: string): boolean {
    return removeAccents(str.toLowerCase()).includes(
        removeAccents(keyword.toLowerCase()),
    );
}

export function appendPermissionToRole(role: Role) {
    // get permissions
    // append permissions attribute from cached permissionList variable
    role.permissions = permissionList.filter((item) => {
        const listIds = role.rolePermissions.map((item) => item.permissionId);
        return listIds.includes(item.id);
    });
    delete role.rolePermissions;
    // append action and resource attributes from cached actions and resources
    role.permissions = role.permissions.map((permission) => {
        const action = actionList.find(
            (pAction) => pAction.id === permission.actionId,
        ) as IPermissionAction;
        const resource = resourceList.find(
            (pResource) => pResource.id === permission.resourceId,
        ) as IPermissionResource;
        return {
            action,
            resource,
            id: permission.id,
        } as Permission;
    });
}
