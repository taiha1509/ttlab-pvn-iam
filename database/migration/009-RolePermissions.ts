import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { commonColumns, DBTABLE_NAME } from '../constant';

export class RolePermissions1632891593009 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.ROLE_PERMISSIONS,
                columns: [
                    ...commonColumns,
                    {
                        name: 'permissionId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'roleId',
                        type: 'int',
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.ROLE_PERMISSIONS);
    }
}
