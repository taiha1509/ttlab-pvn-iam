import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { User } from '../user/entity/user.entity';
import { CommonAppController } from './controllers/common.app.controller';
import { CommonDropdownService } from './services/common-dropdown.service';
@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [CommonAppController],
    providers: [CommonDropdownService, TreeDBService],
})
export class CommonModule {}
