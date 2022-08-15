import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'user_groups' })
export class UserGroup extends BaseEntity {
    @Column({ type: 'int' })
    userId: number;

    @Column({ type: 'int' })
    groupId: number;
}
