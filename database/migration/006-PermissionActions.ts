import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { commonColumns, DBPermissionActions, DBTABLE_NAME } from '../constant';

export class PermissionActions1632891593006 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.PERMISSION_ACTIONS,
                columns: [
                    ...commonColumns,
                    {
                        name: 'content',
                        type: 'enum',
                        enum: Object.values(DBPermissionActions),
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.PERMISSION_ACTIONS);
    }
}
