import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleNames } from '../constants';
import { extractToken } from '../helpers/commonFunctions';
import { Auth0Service } from '../services/auth0.service';
import { createWinstonLogger } from '../services/winston.service';

@Injectable()
export class Auth0Guard implements CanActivate {
    constructor(
        private auth0Service: Auth0Service,
        private readonly configService: ConfigService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        ModuleNames.GUARD,
        this.configService,
    );

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = extractToken(request.headers.authorization || '');
        try {
            if (!token) {
                throw new UnauthorizedException();
            }
            const isValid = await this.auth0Service.verifyAccessToken(token);
            return isValid;
        } catch (error) {
            this.logger.error(
                `Auth0.guard: verify token error, token: ${token}`,
            );
            throw new UnauthorizedException();
        }
    }
}
