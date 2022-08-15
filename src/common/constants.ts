import { SetMetadata } from '@nestjs/common';
import * as joi from 'joi';

export enum Languages {
    EN = 'en',
    VI = 'vi',
}

export enum OrderDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum HttpMethods {
    POST = 'post',
    PATCH = 'patch',
    DELETE = 'delete',
}
export const DEFAULT_LANGUAGE = Languages.VI;
export const TIMEZONE_HEADER = 'x-timezone';
export const DEAULT_TIMEZONE = '+07:00';
export const TIMEZONE_NAME_HEADER = 'x-timezone-name';
export const DEFAULT_TIMEZONE_NAME = 'Asia/Bangkok';
export const ACCEPT_LANGUAGE_HEADER = 'accept-language';

export const DEFAULT_LIMIT_FOR_DROPDOWN = 1000;
export const DEFAULT_LIMIT_FOR_PAGINATION = 10;
export const DEFAULT_ORDER_BY = 'createdAt';
export const DEFAULT_ORDER_DIRECTION = 'desc';
export const DEFAULT_FIRST_PAGE = 1;

export const MIN_ID = 1;
export const MIN_PAGE_LIMIT = 1; // min item per one page
export const MIN_PAGE_VALUE = 1; // min page value
export const MAX_PAGE_LIMIT = 10000; // max item per one page
export const MAX_PAGE_VALUE = 10000; // max page value
export const ARRAY_MAX_LENGTH = 10000; // max length of array in request
export const TOKEN_MAX_LENGTH = 50000; // max length if token

export const BIRTHDAY_MIN_DATE = '1800-01-01';

export const INPUT_TEXT_MAX_LENGTH = 255;
export const INPUT_PHONE_MAX_LENGTH = 11;

export const TEXTAREA_MAX_LENGTH = 2000;

export const MAX_MONTH_VALUE = 12;
export const MIN_MONTH_VALUE = 1;

export const ROUTE_PREFIX_APP = '/app';
export const ROUTE_PREFIX_BACKEND = '/iam';
export const Regex = {
    URI: /^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/,
    EMAIL: /([a-zA-Z0-9]+)([_.\-{1}])?([a-zA-Z0-9]+)@([a-zA-Z0-9]+)([.])([a-zA-Z.]+)/,
    PHONE: /^(0)[\d]{9}$/,
    OBJECT_ID: /^[a-fA-F0-9]{24}$/,
    TEXT_WITHOUT_SPECIAL_CHARACTERS: /^((?![!@#$%^&*()<>?\\/\\+|=]+).)*$/,
    NUMBER: /^(?:[0-9]\d*|)$/,
    PASSWORD:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};
export const MIN_PASSWORD_LENGTH = 6;
export const defaultLang = 'en';

export enum DateFormat {
    YYYY_MM_DD_HYPHEN = 'YYYY-MM-DD',
    HH_mm_ss_DIV = 'HH:mm:ss',
    YYYY_MM_DD_HYPHEN_HH_mm_ss_DIV = 'YYYY-MM-DD HH:mm:ss',
}

export enum SendgridResponseCodes {
    // when send email success
    ACCEPTED = 202,
    // when some required field is missed
    BAD_REQUEST = 400,
    // when api key invalid or expired
    UNAUTHORIZED = 401,
    // when sendgrid is error
    SERVER_ERROR = 500,
    // when access some resource that you don't have permission
    FORBIDDEN = 403,
}

export const baseQueryList = joi.object().keys({
    limit: joi
        .number()
        .optional()
        .min(MIN_PAGE_LIMIT)
        .max(MAX_PAGE_LIMIT)
        .allow(null, ''),
    page: joi
        .number()
        .optional()
        .min(MIN_PAGE_VALUE)
        .max(MAX_PAGE_VALUE)
        .allow(null, ''),
    keyword: joi.string().optional().allow(null, '').max(INPUT_TEXT_MAX_LENGTH),
    orderDirection: joi
        .string()
        .optional()
        .valid(OrderDirection.ASC, OrderDirection.DESC),
});

export class BaseQueryList {
    limit?: number | null;
    page?: number | null;
    orderDirection?: OrderDirection;
    keyword?: string | null;
}

export enum HttpStatus {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    INVALID_USERNAME_OR_PASSWORD = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    GROUP_HAS_CHILDREN = 410,
    GROUP_MAX_LEVEL = 411,
    GROUP_MAX_QUANTITY = 412,
    CVM_ERROR = 420,
    UNPROCESSABLE_ENTITY = 422,
    FORBIDDEN_MODIFY_SUPER_ADMIN = 423,
    ITEM_NOT_EXISTED = 444,
    ITEM_ALREADY_EXIST = 445,
    ITEM_INVALID = 446,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
    TOKEN_INVALID = 405,
}

export const Permissions = (...permissions: string[]) =>
    SetMetadata('permissions', permissions);

export const AllowedFirstLoginRoutes = (allow: boolean) =>
    SetMetadata('allowedFirstLoginRoutes', allow);

export enum ModuleNames {
    USER = 'user',
    USER_GROUP = 'user_group',
    AUTH = 'auth',
    GUARD = 'guard',
    CVM = 'cvm',
    DROPDOWN = 'dropdown',
    ROLE = 'role',
    COMMON = 'common',
}

export const DEFAULT_LIMIT_FOR_RATE_LIMITING = 30;
export const DEFAULT_TTL_FOR_RATE_LIMITING = 60;
