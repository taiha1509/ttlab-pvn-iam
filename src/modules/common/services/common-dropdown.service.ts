import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, getRepository, In } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { QueryDropdownDto } from '../dto/request/dropdownDto';

@Injectable()
export class CommonDropdownService {
    constructor(
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    async getListUser(query: QueryDropdownDto): Promise<User[]> {
        const { status, withDeleted } = query;
        const userRepository = getRepository(User);
        const userList = await userRepository.find({
            select: ['id', 'fullName'],
            withDeleted: withDeleted === 'true',
            where: {
                status: In(status),
            },
        });
        return userList;
    }
}
