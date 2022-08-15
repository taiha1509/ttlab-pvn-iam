import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
    DB_INPUT_TEXT_MAX_LENGTH,
    DBTABLE_NAME,
    commonColumns,
} from '../constant';

export class Role1632891593002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.ROLES,
                columns: [
                    ...commonColumns,
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                        length: DB_INPUT_TEXT_MAX_LENGTH.toString(),
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        isNullable: true,
                        length: DB_INPUT_TEXT_MAX_LENGTH.toString(),
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.ROLES);
    }
}
