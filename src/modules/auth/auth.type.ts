import { Request } from 'express';
import { TokenType } from './auth.constant';
import { Role } from '../role/entity/role.entity';
import { ActiveTypes, UserStatus, UserTypes } from '../user/user.constant';
import { Group } from '../user-group/entity/group.entity';

export interface ITokenInfo {
    token: string;
    expiredIn: number;
}

export interface ITokenResult {
    user: IUserDecodeFromToken;
    accessToken: ITokenInfo;
    refreshToken: ITokenInfo;
}

export interface IRefreshTokenRequest extends Request {
    authorizationType: string;
}

export interface IUserDecodeFromToken {
    username: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    status: UserStatus;
    types: UserTypes[];
    activeTypes: ActiveTypes[];
    roles: Role[];
    groups: Group[];
    id: number;
    firstLogin?: boolean;
    hashToken?: string;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
}

export interface ITokenQuery {
    id?: number;
    token?: string;
    hashToken?: string;
    userId?: number;
    type?: TokenType;
}
