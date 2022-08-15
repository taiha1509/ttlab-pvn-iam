import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import ConfigKey from 'src/common/config/config-key';
import { UserToken } from '../entity/userToken.entity';
import { ActiveUserDto, UpdatePasswordDto } from '../dto/request.dto';
import {
    ITokenInfo,
    ITokenQuery,
    ITokenResult,
    IUserDecodeFromToken,
} from '../auth.type';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import * as fs from 'fs';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { ActiveTypes, UserStatus } from 'src/modules/user/user.constant';
import { listUserQueryBuilderAttributes, TokenType } from '../auth.constant';
import { Regex } from 'src/common/constants';
import { UserSendgridService } from 'src/modules/user/services/user.sendgrid.service';
import { hashPassword } from 'src/common/helpers/commonFunctions';
import { ProfileService } from './profile.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly profileService: ProfileService,
        private readonly i18n: I18nRequestScopeService,
        private readonly sengridService: UserSendgridService,
        private readonly configService: ConfigService,
    ) {}

    generateHashToken(userId: number): string {
        const random = Math.floor(Math.random() * (10000 - 1000) + 1000);
        return `${userId}-${Date.now()}-${random}`;
    }

    private generateAccessToken(data: IUserDecodeFromToken): ITokenInfo {
        const accessTokenExpiredIn = +this.configService.get(
                ConfigKey.ACCESS_TOKEN_EXPIRED_IN,
            ),
            privateKey = this.configService
                .get(ConfigKey.TOKEN_PRIVATE_KEY)
                .replace(/\\n/g, '\n');

        const payload: IUserDecodeFromToken = {
            status: data.status,
            activeTypes: data.activeTypes,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            types: data.types,
            phoneNumber: data.phoneNumber,
            roles: data.roles,
            groups: data.groups,
            id: data.id,
            firstLogin: data.firstLogin,
        };
        const accessToken = jwt.sign(payload, privateKey, {
            expiresIn: accessTokenExpiredIn,
            algorithm: 'RS256',
        });

        return {
            token: accessToken,
            expiredIn: +accessTokenExpiredIn,
        };
    }

    private generateRefreshToken(
        data: IUserDecodeFromToken,
        hashToken: string,
    ): ITokenInfo {
        const refreshTokenExpiredIn = +this.configService.get(
                ConfigKey.REFRESH_TOKEN_EXPIRED_IN,
            ),
            privateKey = this.configService
                .get(ConfigKey.TOKEN_PRIVATE_KEY)
                .replace(/\\n/g, '\n');

        const payload: IUserDecodeFromToken = {
            status: data.status,
            activeTypes: data.activeTypes,
            username: data.username,
            email: data.email,
            types: data.types,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            roles: data.roles,
            groups: data.groups || [],
            id: data.id,
            hashToken,
            firstLogin: data.firstLogin,
        };
        const refreshToken = jwt.sign(payload, privateKey, {
            expiresIn: refreshTokenExpiredIn,
            algorithm: 'RS256',
        });

        return {
            token: refreshToken,
            expiredIn: +refreshTokenExpiredIn,
        };
    }

    async insertUserToken(
        user: User,
        hashToken: string,
        tokenType: TokenType,
        token: string,
    ): Promise<void> {
        await this.entityManager.getRepository(UserToken).insert({
            hashToken,
            userId: user.id,
            type: tokenType,
            token,
        });
    }

    async checkPassword(hashPassword, rawPassword: string): Promise<boolean> {
        if (!rawPassword || !hashPassword) return false;
        return await bcrypt.compare(rawPassword, hashPassword);
    }

    async login(data: User): Promise<ITokenResult> {
        const accessToken = this.generateAccessToken(data);
        const hashToken = this.generateHashToken(+data.id);
        const refreshToken = this.generateRefreshToken(data, hashToken);

        await this.insertUserToken(
            data,
            hashToken,
            TokenType.REFRESH_TOKEN,
            refreshToken.token,
        );
        await this.entityManager
            .getRepository(User)
            .update({ id: data.id }, { lastLoginAt: new Date() });
        const user = { ...data };
        delete user.password;

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    async checkCredential(credential: string): Promise<User | undefined> {
        // get user and
        const queryBuilder = this.entityManager
            .createQueryBuilder(User, 'user')
            .select([...listUserQueryBuilderAttributes, 'user.password']);

        const isEmail = new RegExp(Regex.EMAIL).test(credential);
        let user = null;
        if (isEmail) {
            user = await queryBuilder
                .where('user.email = :email', { email: credential })
                .getOne();
            if (!user?.activeTypes.includes(ActiveTypes.EMAIL)) {
                return undefined;
            }
        } else {
            // TODO check if credential is phone number => login by phone number

            user = await queryBuilder
                .where('user.username = :username', { username: credential })
                .getOne();
            // await this.profileService.appendGroupsToUser(user);
        }
        if (!user) return user;
        await this.profileService.appendRoleToUser(user);
        await this.profileService.appendGroupsToUser(user);
        return user;
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        const queryBuilder = this.entityManager
            .createQueryBuilder(User, 'user')
            .select([...listUserQueryBuilderAttributes]);

        const user = await queryBuilder
            .where('user.email = :email', { email: email })
            .getOne();
        return user;
    }

    async findUserById(id: number): Promise<User | undefined> {
        const queryBuilder = this.entityManager
            .createQueryBuilder(User, 'user')
            .select([...listUserQueryBuilderAttributes]);

        const user = await queryBuilder
            .where('user.id = :id', { id: id })
            .getOne();
        return user;
    }

    async insertTokenInDB(user) {
        // sign new token for send email forgot password
        const hashToken = this.generateHashToken(user.id);
        const tokenExpiredIn = +this.configService.get(
            ConfigKey.FORGOT_PASSWORD_EXPIRED_IN,
        );
        const privateKey = this.configService
            .get(ConfigKey.TOKEN_PRIVATE_KEY)
            .replace(/\\n/g, '\n');
        const payload = {
            ...user,
            hashToken,
        };
        const activeToken = jwt.sign(payload, privateKey, {
            expiresIn: tokenExpiredIn,
            algorithm: 'RS256',
        });

        await this.insertUserToken(
            user as User,
            hashToken,
            TokenType.FORGOT_PASSWORD,
            activeToken,
        );
        return activeToken;
    }

    async findToken(
        hashToken: string,
        condition = null,
    ): Promise<UserToken | unknown> {
        const token = await this.entityManager
            .getRepository(UserToken)
            .findOne({
                where: {
                    ...condition,
                    hashToken: hashToken,
                },
            });
        return token;
    }

    async resetPassword(user, password, foundTokenInDB): Promise<void> {
        const profile = await this.entityManager.getRepository(User).findOne({
            where: {
                id: user.id,
            },
        });
        const hashedpassword = hashPassword(password);
        profile.password = hashedpassword;
        profile.firstLogin = false;
        await this.entityManager.getRepository(User).save(profile);

        await this.entityManager
            .getRepository(UserToken)
            .delete({ hashToken: foundTokenInDB.hashToken });
    }

    async refreshToken(loginUser: IUserDecodeFromToken): Promise<ITokenResult> {
        const refreshedUser = await this.profileService.getProfile(
            loginUser.id,
        );
        const accessToken = this.generateAccessToken(refreshedUser);
        const newHashToken = this.generateHashToken(refreshedUser.id);
        const refreshToken = this.generateRefreshToken(
            refreshedUser,
            newHashToken,
        );
        const userTokenRepository = this.entityManager.getRepository(UserToken);
        await Promise.all([
            // soft delete refresh token
            userTokenRepository.update(
                {
                    hashToken: loginUser.hashToken,
                    userId: loginUser.id,
                },
                {
                    deletedAt: new Date(),
                    deletedBy: loginUser.id,
                },
            ),
            userTokenRepository.insert({
                token: refreshToken.token,
                type: TokenType.REFRESH_TOKEN,
                hashToken: newHashToken,
                userId: loginUser.id,
            }),
        ]);
        return {
            user: refreshedUser,
            accessToken,
            refreshToken,
        };
    }

    async logout(user: IUserDecodeFromToken) {
        const repository = this.entityManager.getRepository(UserToken);
        const userToken = await repository.findOne({
            where: {
                userId: user.id,
            },
        });
        await repository.delete(userToken);
    }

    async verifyEmailInvitationToken(
        token: string,
    ): Promise<IUserDecodeFromToken> {
        const keyPath = path.join(__dirname, '../../../../publicKey.json');
        const keyFile = fs.readFileSync(keyPath, 'utf-8');
        const { key } = JSON.parse(keyFile);
        try {
            return (await jwt.verify(token, key, {
                ignoreExpiration: true,
                algorithms: ['RS256'],
            })) as IUserDecodeFromToken;
        } catch (error) {
            const message = await this.i18n.t('auth.message.invalidToken');
            throw new UnauthorizedException({ message });
        }
    }

    async getToken(query: ITokenQuery): Promise<UserToken> {
        return await this.entityManager.findOne(UserToken, { ...query });
    }

    async activeUserAfterVerifyEmail(
        userId: number,
        data: ActiveUserDto,
    ): Promise<void> {
        await this.entityManager.transaction(async (entityManager) => {
            const userRepository = entityManager.getRepository(User);
            const user = await userRepository.findOne(userId, {
                select: ['id', 'status', 'activeTypes'],
            });
            user.status = UserStatus.ACTIVE;

            user.activeTypes = _.uniq([
                ...user.activeTypes,
                ActiveTypes.EMAIL,
                ActiveTypes.USERNAME,
            ]);

            await userRepository.save(user);

            const userTokenRepository = entityManager.getRepository(UserToken);
            const userToken = await userTokenRepository.findOne({
                where: {
                    userId,
                    token: data.token,
                },
            });
            userToken.deletedAt = new Date();
            await userTokenRepository.save(userToken);
        });
    }

    async updatePassword(data: UpdatePasswordDto): Promise<void> {
        const profile = await this.entityManager.getRepository(User).findOne({
            where: {
                id: data.updatedBy,
            },
        });

        const hashedpassword = hashPassword(data.newPassword);
        profile.password = hashedpassword;
        profile.firstLogin = false;
        await this.entityManager.getRepository(User).save(profile);
    }

    async getHashPassword(userId: number): Promise<string> {
        const user = await this.entityManager
            .getRepository(User)
            .findOne(userId, { select: ['password'] });

        return user.password;
    }
}
