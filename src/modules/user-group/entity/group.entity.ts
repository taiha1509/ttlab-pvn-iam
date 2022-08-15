import { INPUT_TEXT_MAX_LENGTH } from 'src/common/constants';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserGroup } from './userGroupsRelation.entity';

@Entity({ name: 'groups' })
export class Group extends BaseEntity {
    @Column({ type: 'varchar', length: INPUT_TEXT_MAX_LENGTH })
    name: string;

    @Column({ type: 'int' })
    parentId: number | null;

    @Column({ type: 'int' })
    level: number;

    @OneToMany(() => Group, (group) => group.children)
    children: Group[];

    userGroups: UserGroup[];
}
