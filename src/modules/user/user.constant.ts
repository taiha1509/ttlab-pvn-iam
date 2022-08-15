import * as Joi from 'joi';
import {
    baseQueryList,
    INPUT_TEXT_MAX_LENGTH,
    ARRAY_MAX_LENGTH,
    MIN_ID,
    Regex,
} from 'src/common/constants';

export enum SendgridSubject {
    CREATE_USER = 'Thông báo tạo mới tài khoản',
    FORGOT_PASSWORD = 'Thông báo thiết lập mật khẩu mới',
}

export enum UserOrderBy {
    FULL_NAME = 'fullName',
    EMAIL = 'email',
    PASSWORD = 'password',
    PHONE_NUMBER = 'phoneNumber',
    USERNAME = 'username',
    ROLE_ID = 'roleId',
    CREATED_AT = 'createdAt',
}

export enum ActiveTypes {
    EMAIL = 'email',
    PHONE = 'phone',
    USERNAME = 'username',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    REGISTERING = 'registering',
}

export enum UserTypes {
    SYSTEM_ADMIN = 'system_admin',
    DEVICE_ADMIN = 'device_admin',
}
export const userQuerySchema = baseQueryList.keys({
    roleIds: Joi.array()
        .unique()
        .items(Joi.number().min(MIN_ID))
        .max(ARRAY_MAX_LENGTH)
        .label('user.fields.roleIds'),
    groupIds: Joi.array()
        .unique()
        .items(Joi.number().min(MIN_ID))
        .max(ARRAY_MAX_LENGTH)
        .label('user.fields.groupIds'),
    orderBy: Joi.string()
        .valid(...Object.values(UserOrderBy))
        .optional()
        .allow(null, ''),
    statuses: Joi.array()
        .unique()
        .items(Joi.string().valid(...Object.values(UserStatus)))
        .optional(),
});

export const iamUserListQuerySchema = Joi.object().keys({
    ids: Joi.array()
        .max(ARRAY_MAX_LENGTH)
        .unique()
        .items(Joi.number().positive().required())
        .required(),
});

export const userListAttributes = [
    'user.id',
    'user.activeTypes',
    'user.status',
    'user.phoneNumber',
    'user.email',
    'user.fullName',
    'user.username',
    'user.types',
    'user.createdAt',
    'user.firstLogin',
    'user.lastLoginAt',
    'userGroup.id',
    'userGroup.userId',
    'userGroup.groupId',
    'group.id',
    'group.name',
    'group.level',
    'group.parentId',
];

const baseUserSchema = Joi.object().keys({
    fullName: Joi.string()
        .trim()
        .replace(/\s\s+/g, ' ')
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .regex(
            new RegExp(Regex.TEXT_WITHOUT_SPECIAL_CHARACTERS),
            'user.errors.fullName.misMatch',
        )
        .allow(null, '')
        .label('user.fields.fullName'),
    roleIds: Joi.array()
        .unique()
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.number().min(MIN_ID).required())
        .required()
        .label('user.fields.roleId'),
    groupIds: Joi.array()
        .unique()
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.number().min(MIN_ID))
        .label('user.fields.groupId')
        .required(),
    cameraIds: Joi.array()
        .unique()
        .max(ARRAY_MAX_LENGTH)
        .items(
            Joi.string()
                .regex(Regex.OBJECT_ID, 'common.errors.invalid.objectId')
                .optional(),
        )
        .required()
        .label('user.fields.cameraIds'),
    cameraGroupIds: Joi.array()
        .unique()
        .max(ARRAY_MAX_LENGTH)
        .items(
            Joi.string()
                .regex(Regex.OBJECT_ID, 'common.errors.invalid.objectId')
                .optional(),
        )
        .required()
        .label('user.fields.cameraGroupIds'),
    email: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .trim()
        .replace(/\s\s+/g, ' ')
        .regex(new RegExp(Regex.EMAIL), 'user.errors.email.misMatch')
        .required()
        .allow(null, '')
        .label('user.fields.email'),
    phoneNumber: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .trim()
        .replace(/\s\s+/g, ' ')
        .regex(new RegExp(Regex.PHONE), 'user.errors.phoneNumber.misMatch')
        .optional()
        .allow(null, '')
        .label('user.fields.phone'),
});

export const createUserSchema = baseUserSchema.append({
    username: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .trim()
        .replace(/\s\s+/g, ' ')
        .required()
        .regex(
            new RegExp(Regex.TEXT_WITHOUT_SPECIAL_CHARACTERS),
            'user.errors.username.misMatch',
        )
        .label('user.fields.username'),
    password: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('user.fields.password')
        .regex(new RegExp(Regex.PASSWORD), 'user.errors.password.misMatch'),
});

export const updateUserSchema = baseUserSchema.append({});
