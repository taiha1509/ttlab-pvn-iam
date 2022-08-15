import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { DEFAULT_LIMIT_GET_LIST } from 'src/modules/common/common.constants';
import { EntityManager, In, Not } from 'typeorm';
import {
    CreateGroupDto,
    QueryGroupDto,
    UpdateGroupDto,
} from '../dto/request.dto';
import { GroupDetailReponseDto } from '../dto/response.dto';
import { Group } from '../entity/group.entity';
import { UserGroup } from '../entity/userGroupsRelation.entity';
import { listGroupAttributes } from '../group.constants';

@Injectable()
export class GroupService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly treeDBService: TreeDBService,
    ) {}

    async getGroup(id: number): Promise<GroupDetailReponseDto> {
        const group = await this.treeDBService.searchTree(Group, id, [
            ...listGroupAttributes,
        ]);
        return group;
    }

    async createGroup(data: CreateGroupDto) {
        const group = new Group();
        group.name = data.name;
        group.parentId = data.parentId;
        group.level = data.level;
        group.createdBy = data.createdBy;
        group.updatedBy = data.updatedBy;
        await this.entityManager.getRepository(Group).save(group);
        return await this.getGroup(group.id);
    }

    async getListGroups(query: QueryGroupDto) {
        const rootGroups = await this.entityManager.getRepository(Group).find({
            where: {
                parentId: null,
            },
        });
        const promises = [];
        rootGroups.forEach((rootGroup) => {
            promises.push(
                this.treeDBService.searchTree(
                    Group,
                    rootGroup.id,
                    listGroupAttributes,
                    query.keyword,
                ),
            );
        });

        const roots = await Promise.all(promises);
        const result = roots.filter((item) => Object.keys(item).length !== 0);
        return result;
    }

    async deleteGroup(id: number, userId: number) {
        await this.entityManager.transaction(async (entityManager) => {
            await entityManager
                .getRepository(Group)
                .update({ id }, { deletedBy: userId, deletedAt: new Date() });
            await entityManager
                .getRepository(UserGroup)
                .update(
                    { groupId: id },
                    { deletedBy: userId, deletedAt: new Date() },
                );
        });
    }

    async updateGroup(
        data: UpdateGroupDto,
        id: number,
    ): Promise<GroupDetailReponseDto> {
        const group = await this.entityManager.getRepository(Group).findOne(id);
        group.name = data.name;
        group.updatedBy = data.updatedBy;
        await this.entityManager.getRepository(Group).save(group);
        return await this.getGroup(id);
    }

    async checkGroupNameExist(
        parentId: number,
        name: string,
        id = null,
    ): Promise<boolean> {
        const condition = {
            parentId,
            name,
        };
        if (id) {
            condition['id'] = Not(id);
        }
        return (
            (await this.entityManager.getRepository(Group).count({
                where: {
                    ...condition,
                },
            })) > 0
        );
    }
}
