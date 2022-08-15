import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from 'src/common/services/database.service';
import { UserService } from '../user/services/user.database.service';
import { UserSendgridService } from '../user/services/user.sendgrid.service';
import { AuthAppController } from './controllers/auth.app.controller';
import { RefreshTokenMiddleWare } from './auth.middleware';
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { SendgridService } from './services/auth.sendgrid.service';
import { ThrottlerModule } from '@nestjs/throttler';
import {
    DEFAULT_LIMIT_FOR_RATE_LIMITING,
    DEFAULT_TTL_FOR_RATE_LIMITING,
} from 'src/common/constants';
import { RoleService } from '../role/services/role.database.service';
@Module({
    imports: [
        DatabaseService,
        ThrottlerModule.forRoot({
            limit: DEFAULT_LIMIT_FOR_RATE_LIMITING,
            ttl: DEFAULT_TTL_FOR_RATE_LIMITING,
        }),
    ],
    controllers: [AuthAppController],
    providers: [
        AuthService,
        DatabaseService,
        JwtGuard,
        RoleGuard,
        UserSendgridService,
        UserService,
        ProfileService,
        SendgridService,
        RoleService,
    ],
    exports: [JwtGuard, RoleGuard],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RefreshTokenMiddleWare).forRoutes({
            path: '/auth/refresh-token',
            method: RequestMethod.POST,
        });
    }
}
