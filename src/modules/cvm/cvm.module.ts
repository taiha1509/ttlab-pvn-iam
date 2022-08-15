import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HttpConfigService } from 'src/common/services/httpConfig.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            useClass: HttpConfigService,
        }),
    ],
    controllers: [],
    providers: [],
})
export class CVMModule {}
