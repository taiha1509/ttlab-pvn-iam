import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { DBTABLE_NAME } from '../constant';
dotenv.config();
export class SeedingPermissionResources1641379495502
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`insert into ${DBTABLE_NAME.PERMISSION_RESOURCES} (id, content) values 
        (1, 'user'), (2, 'camera'), (3, 'user_group'), (4, 'camera_group')
        , (5, 'role'), (6, 'liveview'), (7, 'playback'), (8, 'e_map');`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `delete from ${DBTABLE_NAME.PERMISSION_RESOURCES} where id in (1,2,3,4,5,6,7,8)`,
        );
    }
}
