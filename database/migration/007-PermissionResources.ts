import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
    commonColumns,
    DBPermissionResources,
    DBTABLE_NAME,
} from '../constant';

export class PermissionActions1632891593007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.PERMISSION_RESOURCES,
                columns: [
                    ...commonColumns,
                    {
                        name: 'content',
                        type: 'enum',
                        enum: Object.values(DBPermissionResources),
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.PERMISSION_RESOURCES);
    }
}
