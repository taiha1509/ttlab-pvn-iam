import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
    commonColumns,
    DBTABLE_NAME,
    DB_INPUT_TEXT_MAX_LENGTH,
} from '../constant';

export class Groups1632891593005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.GROUPS,
                columns: [
                    ...commonColumns,
                    {
                        name: 'name',
                        type: 'varchar',
                        length: DB_INPUT_TEXT_MAX_LENGTH.toString(),
                        isNullable: false,
                    },
                    {
                        name: 'level',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'parentId',
                        type: 'int',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.GROUPS);
    }
}
