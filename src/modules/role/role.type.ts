import { PermissionActions, PermissionResources } from './role.constants';
export interface IPermissionAction {
    id: number;
    content: PermissionActions;
}

export interface IPermissionResource {
    id: number;
    content: PermissionResources;
}

export interface Ipermission {
    id: number;
    actionId: number;
    resourceId: number;
}
