import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, In, Not } from 'typeorm';
import { BaseTree } from '../entities/BaseTree.entity';

@Injectable()
export class DatabaseService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {}

    async checkItemExisted<T>(
        entity: EntityTarget<T>,
        fieldValue: string | number | boolean | Date,
        fieldName = 'id',
        itemId?: number,
    ): Promise<boolean> {
        const whereCondition = {
            [fieldName]: fieldValue,
        };
        if (itemId) {
            // when update item
            Object.assign(whereCondition, {
                id: Not(itemId),
            });
        }
        const item = await this.entityManager.count(entity, {
            where: whereCondition,
        });
        return item > 0;
    }

    /**
     * check if all item in list is valid
     * @param entity type entity
     * @param fieldValue the values list
     * @param fieldName column name
     * @returns true if all item is valid otherwise return false
     */
    async checkIdsExist<T>(
        entity: EntityTarget<T>,
        fieldValue: string[] | number[] | boolean[] | Date[],
        fieldName: keyof T = 'id' as keyof T,
    ): Promise<boolean> {
        return (
            (await this.entityManager.count(entity, {
                where: {
                    [fieldName]: In([...fieldValue]),
                },
            })) === fieldValue.length
        );
    }
}
