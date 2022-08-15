import { TableColumnOptions } from 'typeorm';

export enum DBTABLE_NAME {
    USERS = 'users',
    USER_TOKENS = 'user_tokens',
    ROLES = 'roles',
    USER_GROUPS = 'user_groups',
    GROUPS = 'groups',
    USER_ROLES = 'user_roles',
    PERMISSIONS = 'permissions',
    PERMISSION_RESOURCES = 'permission_resources',
    PERMISSION_ACTIONS = 'permission_actions',
    ROLE_PERMISSIONS = 'role_permissions',
}

export enum DBUserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    REGISTERING = 'registering',
}

export const DB_INPUT_TEXT_MAX_LENGTH = 255;
export const DB_TEXTAREA_MAX_LENGTH = 200;
export enum DBTokenType {
    REFRESH_TOKEN = 'refresh_token',
    EMAIL_INVITATION = 'email_invitation',
    FORGOT_PASSWORD = 'forgot_password',
}

export enum DBActiveTypes {
    EMAIL = 'email',
    PHONE = 'phone',
    USERNAME = 'username',
}

export const commonColumns: TableColumnOptions[] = [
    {
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
    },
    {
        name: 'createdAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: true,
    },
    {
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: true,
    },
    {
        name: 'deletedAt',
        type: 'timestamp',
        isNullable: true,
    },
    {
        name: 'createdBy',
        type: 'int',
        isNullable: true,
    },
    {
        name: 'updatedBy',
        type: 'int',
        isNullable: true,
    },
    {
        name: 'deletedBy',
        type: 'int',
        isNullable: true,
    },
];

export enum DBPermissionActions {
    READ = 'read',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    INVITE = 'invite',
    CONFIG = 'config',
}

export enum DBPermissionResources {
    USER = 'user',
    CAMERA = 'camera',
    USER_GROUP = 'user_group',
    CAMERA_GROUP = 'camera_group',
    ROLE = 'role',
    LIVEVIEW = 'liveview',
    PLAYBACK = 'playback',
    E_MAP = 'e_map',
}
