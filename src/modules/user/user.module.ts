import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAppController } from './controllers/user.app.controller';
import { UserService } from './services/user.database.service';
import { User } from './entity/user.entity';
import { DatabaseService } from 'src/common/services/database.service';
import { UserSendgridService } from './services/user.sendgrid.service';
import { AuthService } from '../auth/services/auth.service';
import { UserIAMController } from './controllers/user.iam.controller';
import { CVMCameraService } from 'src/modules/cvm/camera/camera.service';
import { CVMCameraGroupService } from 'src/modules/cvm/camera-group/camera-group.service';
import { UserIAMService } from './services/user.iam.database.service';
import { CVMUserService } from '../cvm/user/user.service';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from 'src/common/services/httpConfig.service';
import { ProfileService } from '../auth/services/profile.service';
import { RoleService } from '../role/services/role.database.service';
@Module({
    imports: [
        HttpModule.registerAsync({
            useClass: HttpConfigService,
        }),
    ],
    controllers: [UserAppController, UserIAMController],
    providers: [
        ProfileService,
        UserService,
        DatabaseService,
        UserSendgridService,
        AuthService,
        CVMCameraService,
        UserIAMService,
        CVMUserService,
        CVMCameraGroupService,
        RoleService,
    ],
})
export class UserModule {}
