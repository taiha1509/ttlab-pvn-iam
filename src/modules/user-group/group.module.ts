import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { HttpConfigService } from 'src/common/services/httpConfig.service';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { CVMCameraService } from '../cvm/camera/camera.service';
import { GroupAppController } from './controllers/group.app.controller';
import { GroupIAMController } from './controllers/group.iam.controller';
import { GroupService } from './services/group.database.service';
import { GroupIAMService } from './services/group.iam.database.service';
@Module({
    imports: [
        HttpModule.registerAsync({
            useClass: HttpConfigService,
        }),
    ],
    controllers: [GroupAppController, GroupIAMController],
    providers: [
        GroupService,
        DatabaseService,
        TreeDBService,
        GroupIAMService,
        CVMCameraService,
    ],
})
export class GroupModule {}
