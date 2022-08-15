import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_DROPDOWN,
} from 'src/common/constants';
import { Group } from 'src/modules/user-group/entity/group.entity';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { User } from 'src/modules/user/entity/user.entity';
import { EntityManager } from 'typeorm';
import {
    roleListDropdownAttributes,
    userListDropdownAttributes,
} from '../drop-down.constant';
import { QueryListDropdownDto } from '../dto/request/get-list.dto';
import { Role } from 'src/modules/role/entity/role.entity';
@Injectable()
export class DropdownDatabaseService {
    constructor(
        @InjectEntityManager()
        private readonly treeDBService: TreeDBService,
        private readonly entityManager: EntityManager,
    ) {}

    async getUserList(query: QueryListDropdownDto) {
        const {
            page = DEFAULT_FIRST_PAGE,
            limit = DEFAULT_LIMIT_FOR_DROPDOWN,
        } = query;
        const userList = await this.entityManager.getRepository(User).find({
            skip: limit * (page - 1),
            take: limit,
            select: userListDropdownAttributes as (keyof User)[],
        });

        return userList;
    }

    async getRoleList(query: QueryListDropdownDto) {
        const {
            page = DEFAULT_FIRST_PAGE,
            limit = DEFAULT_LIMIT_FOR_DROPDOWN,
        } = query;
        const roleList = await this.entityManager.getRepository(Role).find({
            skip: limit * (page - 1),
            take: limit,
            select: roleListDropdownAttributes as (keyof Role)[],
        });

        return roleList;
    }

    async getRootGroupIds(): Promise<number[]> {
        const groups = await this.entityManager
            .getRepository(Group)
            .find({ where: { parentId: null }, select: ['id'] });
        if (!groups) {
            return [];
        }

        return groups.map((item) => item.id);
    }
}
