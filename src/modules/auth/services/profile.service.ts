import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { EntityManager } from 'typeorm';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Role } from 'src/modules/role/entity/role.entity';
import { listUserAttributes } from '../auth.constant';
import { UserSendgridService } from 'src/modules/user/services/user.sendgrid.service';
import { UserGroup } from 'src/modules/user-group/entity/userGroupsRelation.entity';
import { Group } from 'src/modules/user-group/entity/group.entity';
import { UpdateProfileDto } from '../dto/request.dto';
import { UserRole } from 'src/modules/role/entity/userRolesRelation.entity';
import { RolePermission } from 'src/modules/role/entity/rolePermissionsRelation.entity';
import { appendPermissionToRole } from 'src/common/helpers/commonFunctions';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { ModuleNames } from 'src/common/constants';

@Injectable()
export class ProfileService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly i18n: I18nRequestScopeService,
        private readonly sengridService: UserSendgridService,
        private readonly configService: ConfigService,
    ) {}

    private readonly logger = createWinstonLogger(
        ModuleNames.AUTH,
        this.configService,
    );

    async appendGroupsToUser(user: User) {
        const groups = await this.entityManager
            .createQueryBuilder(Group, 'group')
            .leftJoinAndMapMany(
                'group.userGroups',
                UserGroup,
                'userGroup',
                'userGroup.groupId = group.id',
            )
            .where('userGroup.userId = :userId', { userId: user.id })
            .select(['group.id', 'group.name', 'group.level', 'group.parentId'])
            .getMany();
        user.groups = groups;
    }

    async appendRoleToUser(user: User) {
        const roles = await this.entityManager
            .createQueryBuilder(Role, 'role')
            .leftJoinAndMapMany(
                'role.userRoles',
                UserRole,
                'userRole',
                'userRole.roleId = role.id',
            )
            .leftJoinAndMapMany(
                'role.rolePermissions',
                RolePermission,
                'rolePermission',
                'rolePermission.roleId = role.id',
            )
            .where('userRole.userId = :userId', { userId: user.id })
            .select([
                'role.id',
                'role.name',
                'role.description',
                'rolePermission.permissionId',
            ])
            .getMany();

        roles.forEach((role) => appendPermissionToRole(role));

        user.roles = roles;
    }

    async getProfile(userId: number) {
        const user = await this.entityManager.getRepository(User).findOne({
            where: {
                id: userId,
            },
            select: [...listUserAttributes] as (keyof User)[],
        });
        // await this.appendGroupsToUser(user);
        await this.appendRoleToUser(user);
        return user;
    }

    async updateProfile(id: number, data: UpdateProfileDto) {
        let user = await this.entityManager
            .getRepository(User)
            .findOne({ where: { id } });
        user = {
            ...user,
            ...data,
        };
        await this.entityManager.getRepository(User).save(user);
        const updatedUser = await this.getProfile(id);
        return updatedUser;
    }
}
