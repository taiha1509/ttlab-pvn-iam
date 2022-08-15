import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
    DB_INPUT_TEXT_MAX_LENGTH,
    DBTABLE_NAME,
    DBUserStatus,
    commonColumns,
    DBActiveTypes,
} from '../constant';

export class User1632891593003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.USERS,
                columns: [
                    ...commonColumns,
                    {
                        name: 'email',
                        type: 'varchar',
                        length: DB_INPUT_TEXT_MAX_LENGTH.toString(),
                        isNullable: false,
                    },
                    {
                        name: 'password',
                        type: 'varchar(60)',
                        isNullable: true,
                    },
                    {
                        name: 'fullName',
                        type: 'varchar',
                        length: DB_INPUT_TEXT_MAX_LENGTH.toString(),
                        isNullable: true,
                    },
                    {
                        name: 'phoneNumber',
                        type: 'varchar',
                        length: DB_INPUT_TEXT_MAX_LENGTH.toString(),
                        isNullable: false,
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: Object.values(DBUserStatus),
                        isNullable: false,
                    },
                    {
                        name: 'lastLoginAt',
                        type: 'timestamp',
                        default: null,
                        isNullable: true,
                    },
                    {
                        name: 'firstLogin',
                        type: 'boolean',
                        default: null,
                        isNullable: true,
                    },
                    {
                        name: 'activeTypes',
                        type: 'json',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.USERS);
    }
}
