import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { DBTABLE_NAME } from '../constant';
dotenv.config();
export class SeedingPermissionActions1641379495501
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`insert into ${DBTABLE_NAME.PERMISSION_ACTIONS} (id, content) values 
            (1, 'read'), (2, 'create'), (3, 'update'), 
            (4, 'delete'), (5, 'config'), (6, 'invite');`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `delete from ${DBTABLE_NAME.PERMISSION_ACTIONS} where id in (1,2,3,4,5,6)`,
        );
    }
}
