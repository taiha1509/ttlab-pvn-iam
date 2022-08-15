import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { DropdownAppController } from './controllers/drop-down.app.controller';
import { DropdownDatabaseService } from './services/database.service';
@Module({
    controllers: [DropdownAppController],
    providers: [DropdownDatabaseService, DatabaseService, TreeDBService],
})
export class DropdownModule {}
