import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from 'src/common/services/database.service';
import { Role } from './entity/role.entity';
import { RoleAppController } from './controllers/role.app.controller';
import { RoleService } from './services/role.database.service';
@Module({
    imports: [TypeOrmModule.forFeature([Role])],
    controllers: [RoleAppController],
    providers: [RoleService, DatabaseService],
})
export class RoleModule {}
