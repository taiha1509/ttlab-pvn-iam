import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { DBTABLE_NAME } from '../constant';
dotenv.config();
export class SeedingUserRoles1641379495507 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `insert into ${DBTABLE_NAME.USER_ROLES} (id, userId, roleId, createdBy) values (1, 1, 1, 1);
           `,
        );
        await queryRunner.query(
            `insert into ${DBTABLE_NAME.USER_ROLES} (id, userId, roleId, createdBy) values (2, 2, 1, 1);
           `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `delete from ${DBTABLE_NAME.USER_ROLES} where id = 1 or id = 2)`,
        );
    }
}
