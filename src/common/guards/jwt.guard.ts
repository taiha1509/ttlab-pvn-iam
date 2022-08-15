import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    CanActivate,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { extractToken } from '../helpers/commonFunctions';
import * as fs from 'fs';
import * as path from 'path';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from '../services/winston.service';
import { ModuleNames } from '../constants';
import { IUserDecodeFromToken } from 'src/modules/auth/auth.type';
import { Reflector } from '@nestjs/core';
@Injectable()
export class JwtGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly i18n: I18nRequestScopeService,
        private readonly configService: ConfigService,
    ) {}

    private readonly logger = createWinstonLogger(
        ModuleNames.GUARD,
        this.configService,
    );

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const allowedFirstLoginRoute = this.reflector.get<boolean | undefined>(
            'allowedFirstLoginRoutes',
            context.getHandler(),
        );

        const token = extractToken(request.headers.authorization || '');
        if (!token) {
            throw new UnauthorizedException();
        }

        const user = (await this.verifyToken(token)) as IUserDecodeFromToken;
        request.loginUser = user;

        // only allow user change password when first login
        if (user?.firstLogin && !allowedFirstLoginRoute) {
            throw new UnauthorizedException();
        }
        return true;
    }

    async verifyToken(token: string) {
        const keyPath = path.join(__dirname, '../../../publicKey.json');
        const keyFile = fs.readFileSync(keyPath, 'utf-8');
        const { key } = JSON.parse(keyFile);
        try {
            return await jwt.verify(token, key, {
                ignoreExpiration: false,
                algorithms: ['RS256'],
            });
        } catch (error) {
            const message = await this.i18n.t('auth.message.invalidToken');
            this.logger.error(`Jwt.guard: verify token error, token: ${token}`);
            throw new UnauthorizedException({ message });
        }
    }
}
