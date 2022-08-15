import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { commonColumns, DBTABLE_NAME } from '../constant';

export class UserGroup1632891593004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.USER_GROUPS,
                columns: [
                    ...commonColumns,
                    {
                        name: 'userId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'groupId',
                        type: 'int',
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.USER_GROUPS);
    }
}
