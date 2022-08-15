import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
    DBTABLE_NAME,
    DB_TEXTAREA_MAX_LENGTH,
    DBTokenType,
    commonColumns,
} from '../constant';

export class UserToken1632891593001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: DBTABLE_NAME.USER_TOKENS,
                columns: [
                    ...commonColumns,
                    {
                        name: 'userId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'token',
                        type: 'blob',
                    },
                    {
                        name: 'hashToken',
                        type: 'varchar',
                        length: DB_TEXTAREA_MAX_LENGTH.toString(),
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: Object.values(DBTokenType),
                        default: `"${DBTokenType.REFRESH_TOKEN}"`,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(DBTABLE_NAME.USER_TOKENS);
    }
}
