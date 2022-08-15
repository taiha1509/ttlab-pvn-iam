export enum PermissionActions {
    READ = 'read',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    INVITE = 'invite',
    CONFIG = 'config',
}

export enum PermissionResources {
    USER = 'user',
    CAMERA = 'camera',
    USER_GROUP = 'user_group',
    CAMERA_GROUP = 'camera_group',
    ROLE = 'role',
    LIVEVIEW = 'liveview',
    PLAYBACK = 'playback',
    E_MAP = 'e_map',
}

export const systemAdminResources = [
    PermissionResources.USER,
    PermissionResources.USER_GROUP,
    PermissionResources.ROLE,
];
export const deviceAdminResources = [
    PermissionResources.CAMERA,
    PermissionResources.CAMERA_GROUP,
    PermissionResources.E_MAP,
    PermissionResources.LIVEVIEW,
    PermissionResources.PLAYBACK,
];

export const roleAttributesList = [
    'role.id',
    'role.name',
    'role.description',
    'rolePermission.permissionId',
];

export const baseActions = [
    PermissionActions.READ,
    PermissionActions.UPDATE,
    PermissionActions.DELETE,
    PermissionActions.CREATE,
];
