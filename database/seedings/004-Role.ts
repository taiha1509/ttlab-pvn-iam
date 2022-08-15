import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { DBTABLE_NAME } from '../constant';
dotenv.config();
export class SeedingRoles1641379495504 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `insert into ${DBTABLE_NAME.ROLES} (id, name, description, createdBy) values(1, "Supervisor", "Supervisor", 1);`,
        );
        await queryRunner.query(
            `insert into ${DBTABLE_NAME.ROLES} (id, name, description, createdBy) values(2, "Super admin", "Super admin", 1);`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `delete from ${DBTABLE_NAME.ROLES} where id = 1)`,
        );
        await queryRunner.query(
            `delete from ${DBTABLE_NAME.ROLES} where id = 2)`,
        );
    }
}
