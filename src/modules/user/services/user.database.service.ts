import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import ConfigKey from 'src/common/config/config-key';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    OrderDirection,
} from 'src/common/constants';
import { Brackets, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../dto/request/create-user.dto';
import { UserQueryDto } from '../dto/request/get-user.dto';
import { UserResponseDto } from '../dto/response/detail-user.dto';
import { User } from '../entity/user.entity';
import { CommonListResponse } from 'src/common/helpers/response';
import { Role } from 'src/modules/role/entity/role.entity';
import {
    ActiveTypes,
    userListAttributes,
    UserOrderBy,
    UserStatus,
} from '../user.constant';
import { UserToken } from 'src/modules/auth/entity/userToken.entity';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { TokenType } from 'src/modules/auth/auth.constant';
import * as jwt from 'jsonwebtoken';
import { UserSendgridService } from './user.sendgrid.service';
import { hashPassword } from 'src/common/helpers/commonFunctions';
import { Group } from 'src/modules/user-group/entity/group.entity';
import { UserGroup } from 'src/modules/user-group/entity/userGroupsRelation.entity';
import { UserRole } from 'src/modules/role/entity/userRolesRelation.entity';
import { ProfileService } from 'src/modules/auth/services/profile.service';
import { RoleService } from 'src/modules/role/services/role.database.service';
import { compact, concat } from 'lodash';
@Injectable()
export class UserService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly authService: AuthService,
        private readonly profileService: ProfileService,
        private readonly roleService: RoleService,
        private readonly userSendgridService: UserSendgridService,
    ) {}

    async insertUserToDB(user: CreateUserDto): Promise<UserResponseDto> {
        const status = user.email ? UserStatus.REGISTERING : UserStatus.ACTIVE;
        const activeTypes = [];
        if (user.email) {
            activeTypes.push(ActiveTypes.EMAIL);
        }
        let createdUser;
        await this.entityManager.transaction(async (entityManager) => {
            const userRepository = entityManager.getRepository(User);
            const userGroupRepository = entityManager.getRepository(UserGroup);
            const temp = { ...user };
            delete temp.groupIds;
            delete temp.roleIds;
            delete temp.cameraIds;
            delete temp.cameraGroupIds;
            // insert to user table
            createdUser = await userRepository.save({
                ...temp,
                types: [],
                status,
                activeTypes,
                password: hashPassword(user.password),
            });
            // insert to user group relation table
            const insertRelationTable = [];
            if (user.groupIds.length > 0) {
                const userGroupEntity = [];
                for (const groupId of user.groupIds) {
                    userGroupEntity.push({
                        groupId,
                        userId: createdUser.id,
                    });
                }
                insertRelationTable.push(
                    userGroupRepository.save(userGroupEntity),
                );
            }

            // insert to user_roles relation table
            const userRoleEntity = [];
            for (const roleId of user.roleIds) {
                userRoleEntity.push({
                    roleId,
                    userId: createdUser.id,
                });
            }
            insertRelationTable.push(
                entityManager.getRepository(UserRole).save(userRoleEntity),
            );

            // execute
            await Promise.all([...insertRelationTable]);
        });
        return await this.getUserDetail(createdUser.id);
    }

    private getUserQueryBuilderMappingUserGroup(): SelectQueryBuilder<UserResponseDto> {
        return this.entityManager
            .createQueryBuilder<UserResponseDto>(User, 'user')
            .leftJoinAndMapMany(
                'user.userGroups',
                UserGroup,
                'userGroup',
                'userGroup.userId = user.id',
            )
            .leftJoinAndMapMany(
                'user.groups',
                Group,
                'group',
                'userGroup.groupId = group.id',
            );
    }

    private getUserQueryBuilderMappingRole(
        queryBuilder: SelectQueryBuilder<UserResponseDto>,
    ): void {
        queryBuilder
            .leftJoinAndMapMany(
                'user.userRoles',
                UserRole,
                'userRole',
                'userRole.userId = user.id',
            )
            .leftJoinAndMapMany(
                'user.roles',
                Role,
                'role',
                'role.id = userRole.roleId',
            );
    }

    async getUserList(
        query: UserQueryDto,
    ): Promise<CommonListResponse<UserResponseDto>> {
        const {
            page = DEFAULT_FIRST_PAGE,
            limit = DEFAULT_LIMIT_FOR_PAGINATION,
            keyword,
            orderBy = UserOrderBy.CREATED_AT,
            orderDirection = OrderDirection.ASC,
            groupIds = [],
            roleIds = [],
            statuses = [],
        } = query;

        const queryBuilder = this.getUserQueryBuilderMappingUserGroup();
        if (keyword) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.orWhere('user.username LIKE :username', {
                        username: `%${keyword}%`,
                    });
                    qb.orWhere('user.email LIKE :email', {
                        email: `%${keyword}%`,
                    });
                    qb.orWhere('user.phoneNumber LIKE :phoneNumber', {
                        phoneNumber: `%${keyword}%`,
                    });
                    qb.orWhere('user.fullName LIKE :fullName', {
                        fullName: `%${keyword}%`,
                    });
                }),
            );
        }
        this.getUserQueryBuilderMappingRole(queryBuilder);
        queryBuilder.select([
            ...userListAttributes,
            'role.name',
            'role.id',
            'role.description',
        ]);

        queryBuilder.andWhere(
            new Brackets((qb) => {
                if (groupIds.length > 0) {
                    qb.andWhere('group.id IN (:groupIds)', {
                        groupIds,
                    });
                }

                if (roleIds.length > 0) {
                    qb.andWhere('role.id IN (:roleIds)', {
                        roleIds,
                    });
                }

                if (statuses.length > 0) {
                    qb.andWhere('user.status IN (:statuses)', {
                        statuses,
                    });
                }
            }),
        );

        if (orderBy) {
            queryBuilder
                .addSelect(`LOWER(user.${orderBy})`, 'tempOrderByField')
                .orderBy(
                    'tempOrderByField',
                    orderDirection ? orderDirection : OrderDirection.ASC,
                );
        }

        //paginate
        queryBuilder.take(limit).skip((page - 1) * limit);

        const [users, totalItems] = await queryBuilder.getManyAndCount();

        return {
            items: users as UserResponseDto[],
            totalItems,
        };
    }

    async getUserDetail(id: number): Promise<UserResponseDto> {
        const user = await this.getUserQueryBuilderMappingUserGroup()
            .select(userListAttributes)
            .where('user.id = :id', { id })
            .getOne();
        if (!user) return user;

        const roles = await this.entityManager
            .createQueryBuilder(Role, 'role')
            .leftJoinAndMapMany(
                'role.useRoles',
                UserRole,
                'userRole',
                'role.id = userRole.roleId',
            )
            .select(['role.id', 'role.name', 'role.description'])
            .where('userRole.userId = :userId', { userId: user.id })
            .getMany();
        user.roles = roles;
        return user;
    }

    async deleteUser(id: number, userId: number): Promise<boolean> {
        let result = false;
        await this.entityManager.transaction(async (entityManager) => {
            const deletedUser = await entityManager
                .getRepository(User)
                .update({ id }, { deletedBy: userId, deletedAt: new Date() });

            await Promise.all([
                entityManager
                    .getRepository(UserToken)
                    .update(
                        { userId: id },
                        { deletedAt: new Date(), deletedBy: id },
                    ),
                entityManager
                    .getRepository(UserGroup)
                    .update(
                        { userId: id },
                        { deletedAt: new Date(), deletedBy: id },
                    ),
                entityManager
                    .getRepository(UserRole)
                    .update(
                        { userId: id },
                        { deletedAt: new Date(), deletedBy: id },
                    ),
            ]);
            result = deletedUser.affected > 0;
        });
        return result;
    }

    async updateUser(
        id: number,
        data: UpdateUserDto,
    ): Promise<UserResponseDto> {
        delete data.createdBy;
        const groupIds = data.groupIds;
        const roleIds = data.roleIds;
        delete data.roleIds;
        delete data.groupIds;
        delete data.cameraIds;
        delete data.cameraGroupIds;
        // get user
        let user = await this.entityManager
            .getRepository(User)
            .findOne({ where: { id } });
        user = {
            ...user,
            ...data,
        };
        await this.entityManager.transaction(async (entityManager) => {
            await entityManager.getRepository(User).save(user);

            const userGroupRepository = entityManager.getRepository(UserGroup);
            const userRoleRepository = entityManager.getRepository(UserRole);

            // delete all existed record in user_groups relation table
            // delete all existed record in user_roles relation table
            await Promise.all([
                userGroupRepository.delete({ userId: id }),
                userRoleRepository.delete({ userId: id }),
            ]);

            const userGroupEntity = [];
            for (const item of groupIds) {
                userGroupEntity.push({
                    groupId: item,
                    userId: id,
                });
            }
            const userRoleEntity = [];
            for (const item of roleIds) {
                userRoleEntity.push({
                    roleId: item,
                    userId: id,
                });
            }
            // insert new records to user_groups relation tables
            // insert new records to user_roles relation tables
            await Promise.all([
                userGroupRepository.save(userGroupEntity),
                userRoleRepository.save(userRoleEntity),
            ]);
        });
        const updatedUser = await this.getUserDetail(id);

        // TODO verify by email

        // TODO verify user by otp
        return updatedUser;
    }

    async sendEmailInvitation(userId: number, token = ''): Promise<void> {
        if (token) {
            //delete existed token
            const userToken = await this.entityManager
                .getRepository(UserToken)
                .findOne({
                    where: { token, type: TokenType.EMAIL_INVITATION },
                });
            if (userToken) {
                userToken.deletedAt = new Date();
                await this.entityManager
                    .getRepository(UserToken)
                    .save(userToken);
            }
        }

        const newUser = await this.getUserDetail(userId);

        const hashToken = this.authService.generateHashToken(newUser.id);
        const tokenExpiredIn =
            +process.env[ConfigKey.INVITATION_EMAIL_TOKEN_EXPIRED_IN];

        const privateKey = process.env[ConfigKey.TOKEN_PRIVATE_KEY].replace(
            /\\n/g,
            '\n',
        );
        const payload = {
            ...newUser,
            hashToken,
        };
        const activeToken = jwt.sign(payload, privateKey, {
            expiresIn: tokenExpiredIn,
            algorithm: 'RS256',
        });

        await this.authService.insertUserToken(
            newUser as User,
            hashToken,
            TokenType.EMAIL_INVITATION,
            activeToken,
        );

        const createdUser = await this.getUserDetail(newUser.id);
        this.userSendgridService.sendInvitationEmail(createdUser, activeToken);
    }
}
