import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'user_roles' })
export class UserRole extends BaseEntity {
    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: false })
    roleId: number;
}
