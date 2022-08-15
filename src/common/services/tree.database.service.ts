import { InjectEntityManager } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { maxLevel } from 'src/modules/user-group/group.constants';
import { EntityManager, EntityTarget, In } from 'typeorm';
import { BaseTree } from '../entities/BaseTree.entity';
import { vietnameseStringInclude } from '../helpers/commonFunctions';

export class TreeDBService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {}

    /**
     * find all children and append to root node
     * @param entity type
     * @param parentId parent id of node
     * @param selectAttributes attribute selection
     * @returns root of tree contain all children
     */
    private async getSubTree<T extends BaseTree<T>>(
        entity: EntityTarget<T>,
        parentIds: number[],
        selectAttributes: (keyof T)[],
    ): Promise<T[]> {
        const children = await this.entityManager.getRepository(entity).find({
            where: {
                parentId: In(parentIds),
            },
            select: uniq([...selectAttributes, 'id', 'parentId']),
        });

        if (children.length === 0) {
            return children;
        }

        let childrenIds = children.map((item) => item.id);
        let tempChildren = children;

        for (let level = 2; level <= maxLevel; level++) {
            const nextLevelChildren = await this.entityManager
                .getRepository(entity)
                .find({
                    where: {
                        parentId: In(childrenIds),
                    },
                    select: uniq([...selectAttributes, 'id', 'parentId']),
                });

            // build the tree
            tempChildren.forEach((child) => {
                child.children = nextLevelChildren.filter(
                    (item) => item.parentId === child.id,
                );
            });
            tempChildren = nextLevelChildren;

            childrenIds = nextLevelChildren.map((item) => item.id);
        }

        return children;
    }

    /**
     *
     * @param node current node
     * @param keyword keyword to filter
     * @returns boolean
     * check if current node or any it's children have name contain that keyword
     */
    private childContainKeyword<T extends BaseTree<T>>(
        node: T,
        keyword: string,
    ): boolean {
        if (vietnameseStringInclude(node.name, keyword)) return true;
        if (node.children.length === 0) {
            return false;
        }

        let flag = false;
        for (const temp of node.children) {
            if (this.childContainKeyword(temp, keyword)) {
                flag = true;
                break;
            }
        }

        return flag;
    }

    /**
     * prune tree by keyword
     * @param tree node must be cut children
     * @param keyword keyword
     * @returns void
     */
    private pruneTree<T extends BaseTree<T>>(tree: T, keyword: string) {
        if (!this.childContainKeyword(tree, keyword)) {
            for (const member in tree) delete tree[member];
            return;
        }
        const pointer = tree?.children;
        if (!pointer || pointer?.length === 0) {
            return;
        }

        tree.children = pointer.filter((item) =>
            this.childContainKeyword(item, keyword),
        );

        for (const node of pointer) {
            this.pruneTree(node, keyword);
        }
    }

    /**
     * search tree by keyword
     * @param entity type of tree
     * @param id id of root
     * @param selectAttributes list attributes
     * @param keyword keyword
     * @returns tree after search
     */
    async searchTree<T extends BaseTree<T>>(
        entity: EntityTarget<T>,
        id: number,
        selectAttributes: (keyof T)[] = [],
        keyword = '',
    ): Promise<T> {
        const root = await this.entityManager
            .getRepository(entity)
            .findOne(id, { select: [...selectAttributes] });
        if (!root) return undefined;
        const childrenLevel2 = await this.getSubTree<T>(
            entity,
            [root.id],
            selectAttributes,
        );
        root.children = childrenLevel2;
        if (keyword) {
            this.pruneTree(root, keyword);
        }
        return root;
    }

    /**
     * count number of parent
     * @param entity tree type
     * @param id id of node
     * @returns number of parent of this node
     */
    private async countParent<T extends BaseTree<T>>(
        entity: EntityTarget<T>,
        id: number,
    ): Promise<number> {
        const node = await this.entityManager.getRepository(entity).findOne(id);
        if (!node?.parentId) {
            return 0;
        }

        return (await this.countParent(entity, node.parentId)) + 1;
    }

    /**
     * get number of node
     * @param entity tree type
     * @param id node id
     * @returns level of node
     */
    async getLevel<T extends BaseTree<T>>(entity: EntityTarget<T>, id: number) {
        return (await this.countParent(entity, id)) + 1;
    }

    /**
     * check if node has any children
     * @param entity tree type
     * @param id node id
     * @returns true if node has at least one child, otherwise return false
     */
    async nodeHasChildren<T extends BaseTree<T>>(
        entity: EntityTarget<T>,
        id: number,
    ): Promise<boolean> {
        const count = await this.entityManager.getRepository(entity).count({
            where: {
                parentId: id,
            },
        });

        return count > 0;
    }
}
