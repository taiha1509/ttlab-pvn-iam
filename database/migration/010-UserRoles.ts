import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { commonColumns, DBTABLE_NAME } from '../constant';

export class UserRoles1632891593010 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.USER_ROLES,
                columns: [
                    ...commonColumns,
                    {
                        name: 'roleId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'userId',
                        type: 'int',
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.USER_ROLES);
    }
}
