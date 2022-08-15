import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { commonColumns, DBTABLE_NAME } from '../constant';

export class Permissions1632891593008 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.PERMISSIONS,
                columns: [
                    ...commonColumns,
                    {
                        name: 'actionId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'resourceId',
                        type: 'int',
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.PERMISSIONS);
    }
}
