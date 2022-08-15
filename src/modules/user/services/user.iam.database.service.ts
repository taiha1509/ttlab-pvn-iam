import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IDataList } from 'src/common/interfaces';
import { DEFAULT_LIMIT_GET_LIST } from 'src/modules/common/common.constants';
import { EntityManager, In } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserIAMService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {}

    async getUserList(ids: number[]): Promise<IDataList<User>> {
        const [items, totalItems] = await this.entityManager
            .getRepository(User)
            .findAndCount({
                where: { id: In(ids) },
                select: ['id', 'username'],
                take: DEFAULT_LIMIT_GET_LIST,
            });

        return {
            items,
            totalItems,
        };
    }
}
