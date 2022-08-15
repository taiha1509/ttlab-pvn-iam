import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { IDataList } from 'src/common/interfaces';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { DEFAULT_LIMIT_GET_LIST } from 'src/modules/common/common.constants';
import { User } from 'src/modules/user/entity/user.entity';
import { EntityManager, In } from 'typeorm';
import { Group } from '../entity/group.entity';
import { UserGroup } from '../entity/userGroupsRelation.entity';
import { maxLevel } from '../group.constants';

@Injectable()
export class GroupIAMService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly treeDBService: TreeDBService,
    ) {}
    async getGroupList(ids: number[]): Promise<IDataList<Group>> {
        const [items, totalItems] = await this.entityManager
            .getRepository(Group)
            .findAndCount({
                select: ['id', 'name'],
                where: { id: In(ids) },
                take: DEFAULT_LIMIT_GET_LIST,
            });
        return {
            items,
            totalItems,
        };
    }

    /**
     * get all id in list user group,
     * each user group, get all children group, and return a user group id array
     * @param ids list user group ids
     * return list user group ids
     */
    async getIdsInGroupTreeByIds(ids: number[]): Promise<IDataList<number>> {
        const listGroupIds: number[] = [];
        const groupRepository = this.entityManager.getRepository(Group);

        let parentList = await groupRepository.find({
            where: {
                id: In(ids),
            },
            select: ['id', 'parentId'],
        });
        for (let level = 1; level <= maxLevel - 1; level++) {
            const tempIds = parentList.map((item) => item.id);
            if (tempIds.length > 0) {
                listGroupIds.push(...tempIds);
                parentList = await groupRepository.find({
                    where: {
                        parentId: In(tempIds),
                    },
                    select: ['id', 'parentId'],
                });
            }
        }

        const uniqeListGroupIds = uniq(listGroupIds);

        return {
            items: uniqeListGroupIds,
            totalItems: uniqeListGroupIds.length,
        };
    }
}
