import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import { DBTABLE_NAME } from '../constant';

export class ModifyUser1632891593011 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            DBTABLE_NAME.USERS,
            new TableColumn({
                name: 'types',
                type: 'json',
                comment: `This is field contain array of types of an user, if type is system_admin then 
                this user have all permission in modules: users, user-group, roles. If type is device_admin' then this user have all permission in remain modules (camera, camera-group, e-map, liveview, playback)
                in the system.`,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(DBTABLE_NAME.USERS, 'types');
    }
}
