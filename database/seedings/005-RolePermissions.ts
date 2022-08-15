import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { DBTABLE_NAME } from '../constant';
dotenv.config();
export class SeedingRolePermissions1641379495505 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `insert into ${DBTABLE_NAME.ROLE_PERMISSIONS} (id, roleId, permissionId, createdBy) values
            (1, 1, 1, 1),(2, 1, 2, 1),(3, 1, 3, 1),(4, 1, 4, 1),(5, 1, 5, 1),(6, 1, 6, 1),(7, 1, 7, 1),(8, 1, 8, 1),(9, 1, 9, 1),(10, 1, 10, 1),
            (11, 1, 11, 1),(12, 1, 12, 1),(13, 1, 13, 1),(14, 1, 14, 1),(15, 1, 15, 1),(16, 1, 16, 1),(17, 1, 17, 1),(18, 1, 18, 1),(19, 1, 19, 1),(20, 1, 20, 1),
            (21, 1, 21, 1),(22, 1, 22, 1),(23, 1, 23, 1),(24, 1, 24, 1),(25, 1, 25, 1),(26, 1, 26, 1),(27, 1, 27, 1),(28, 1, 28, 1),(29, 1, 29, 1),(30, 1, 30, 1),
            (31, 1, 31, 1),(32, 1, 32, 1),(33, 1, 33, 1),(34, 1, 34, 1);`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const ids = [];
        for (let i = 1; i <= 34; i++) {
            ids.push(i);
        }
        await queryRunner.query(
            `delete from ${
                DBTABLE_NAME.ROLE_PERMISSIONS
            } where id in (${ids.join(',')})`,
        );
    }
}
