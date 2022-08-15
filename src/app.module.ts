import { Module, Scope } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { I18nModule } from './common/services/i18n.service';
import { WinstonModule } from './common/services/winston.service';
import { DatabaseModule } from './common/services/database.module';
import envSchema from './common/config/validation-schema';
import { RoleModule } from './modules/role/role.module';
import { AuthModule } from './modules/auth/auth.modules';
import { AppController } from './app.controller';
import { CommonModule } from './modules/common/common.module';
import { TransformInterceptor } from './common/transform.interceptor';
import { HttpExceptionFilter } from './common/exceptions.filter';
import { GroupModule } from './modules/user-group/group.module';
import { DropdownModule } from './modules/drop-down/drop-down.module';
import { CVMModule } from './modules/cvm/cvm.module';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from './common/services/httpConfig.service';
import { GlobalDataService } from './modules/common/services/global-data.service';
import { Auth0Module } from './common/services/auth0.service';
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
            validationSchema: envSchema,
        }),
        HttpModule.registerAsync({
            useClass: HttpConfigService,
        }),
        WinstonModule,
        DatabaseModule,
        I18nModule,
        UserModule,
        RoleModule,
        AuthModule,
        CommonModule,
        GroupModule,
        DropdownModule,
        CVMModule,
        Auth0Module,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            scope: Scope.REQUEST,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
        GlobalDataService,
    ],
})
export class AppModule {}
