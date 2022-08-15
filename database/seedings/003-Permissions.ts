import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { DBTABLE_NAME } from '../constant';
dotenv.config();
export class SeedingPermission1641379495503 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`insert into ${DBTABLE_NAME.PERMISSIONS} (id, actionId, resourceId, createdBy) values
        (1, 1, 1, 1),(2, 2, 1, 1),(3, 3, 1, 1),(4, 4, 1, 1),(5, 1, 2, 1),(6, 2, 2, 1),(7, 3, 2, 1),(8, 4, 2, 1),(9, 1, 3, 1),(10, 2, 3, 1),
        (11, 3, 3, 1),(12, 4, 3, 1),(13, 1, 4, 1),(14, 2, 4, 1),(15, 3, 4, 1),(16, 4, 4, 1),(17, 1, 5, 1),(18, 2, 5, 1),(19, 3, 5, 1),(20, 4, 5, 1),
        (21, 1, 6, 1),(22, 2, 6, 1),(23, 3, 6, 1),(24, 4, 6, 1),(25, 1, 7, 1),(26, 2, 7, 1),(27, 3, 7, 1),(28, 4, 7, 1),(29, 1, 8, 1),(30, 2, 8, 1),
        (31, 3, 8, 1),(32, 4, 8, 1),(33, 5, 2, 1),(34, 6, 1, 1);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const ids = [];
        for (let i = 1; i <= 34; i++) {
            ids.push(i);
        }
        await queryRunner.query(
            `delete from ${DBTABLE_NAME.PERMISSIONS} where id in (${ids.join(
                ',',
            )})`,
        );
    }
}
