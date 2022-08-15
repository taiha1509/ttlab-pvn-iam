import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { DBTABLE_NAME } from '../constant';
dotenv.config();
export class SeedingUsers1641379495506 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `insert into ${DBTABLE_NAME.USERS} (id, email, password, fullName, username, phoneNumber, status, activeTypes, types) values(1, "hant@tokyotechlab.com",
            "$2a$10$jfmb6b19qlZJklmyK4UPLOlNectwRHb0le.Sx5kOgkRauKaRiyP3y", "Nguyen Tai Ha", "hant", "0999999999", "active", '["email", "username"]', '["system_admin"]');
           `,
        );
        await queryRunner.query(
            `insert into ${DBTABLE_NAME.USERS} (id, email, password, fullName, username, phoneNumber, status, activeTypes, types) values(2, "admin@pavana.com",
            "$2a$10$jfmb6b19qlZJklmyK4UPLOlNectwRHb0le.Sx5kOgkRauKaRiyP3y", "Pavana", "pavana", "0999999999", "active", '["email", "username"]', '["device_admin"]');
           `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `delete from ${DBTABLE_NAME.USERS} where id = 1 or id = 2)`,
        );
    }
}
