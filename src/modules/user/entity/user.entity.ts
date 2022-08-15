import { Entity, Column, ManyToOne } from 'typeorm';

import { INPUT_TEXT_MAX_LENGTH } from 'src/common/constants';
import { Role } from 'src/modules/role/entity/role.entity';
import { ActiveTypes, UserStatus, UserTypes } from '../user.constant';
import { Group } from 'src/modules/user-group/entity/group.entity';
import { UserGroup } from 'src/modules/user-group/entity/userGroupsRelation.entity';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { CVMCameraDetailResponseDto } from 'src/modules/cvm/camera/dto/camera.dto';
import { CVMCameraGroupDetailResponseDto } from 'src/modules/cvm/camera-group/dto/camera-group.dto';
import { UserRole } from 'src/modules/role/entity/userRolesRelation.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @Column({ length: INPUT_TEXT_MAX_LENGTH, nullable: true })
    fullName: string | null;

    @Column({ length: INPUT_TEXT_MAX_LENGTH, nullable: true })
    email: string | null;

    @Column({ type: 'varchar', nullable: true, length: INPUT_TEXT_MAX_LENGTH })
    phoneNumber: string;

    @Column({
        type: 'json',
        nullable: false,
        default: [],
    })
    activeTypes: ActiveTypes[];

    @Column({ length: INPUT_TEXT_MAX_LENGTH, nullable: true })
    password: string;

    @Column({ type: 'enum', enum: UserStatus, nullable: false })
    status: UserStatus;

    @Column({ type: 'varchar', nullable: false, length: 255 })
    username: string;

    @Column({
        type: 'json',
        default: [],
        nullable: true,
    })
    types: UserTypes[];

    roles: Role[];

    userRoles: UserRole[];

    groups: Group[];

    userGroups: UserGroup[];

    cameras: CVMCameraDetailResponseDto[];

    cameraGroups: CVMCameraGroupDetailResponseDto[];

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @Column({ type: 'boolean', nullable: true })
    firstLogin?: boolean;
}
