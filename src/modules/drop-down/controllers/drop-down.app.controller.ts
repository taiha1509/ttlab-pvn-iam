import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
} from '@nestjs/common';
import { ROUTE_PREFIX_APP } from 'src/common/constants';
import { SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { Group } from '../../user-group/entity/group.entity';
import { groupListDropdownAttributes } from '../drop-down.constant';
import {
    QueryListDropdownDto,
    queryListDropdownSchema,
} from '../dto/request/get-list.dto';
import { DropdownDatabaseService } from '../services/database.service';

@Controller(`${ROUTE_PREFIX_APP}/drop-down`)
export class DropdownAppController {
    constructor(
        private readonly dropdownDatabaseService: DropdownDatabaseService,
        private readonly treeDBService: TreeDBService,
    ) {}

    @Get('/user')
    async getUserList(
        @Query(
            new JoiValidationPipe(queryListDropdownSchema),
            new RemoveEmptyQueryPipe(),
        )
        query: QueryListDropdownDto,
    ) {
        try {
            const userList = await this.dropdownDatabaseService.getUserList(
                query,
            );
            return new SuccessResponse(userList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/role')
    async getRoleList(
        @Query(
            new JoiValidationPipe(queryListDropdownSchema),
            new RemoveEmptyQueryPipe(),
        )
        query: QueryListDropdownDto,
    ) {
        try {
            const roleList = await this.dropdownDatabaseService.getRoleList(
                query,
            );
            return new SuccessResponse(roleList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/group')
    async getGroupList() {
        try {
            const groupIds =
                await this.dropdownDatabaseService.getRootGroupIds();
            if (groupIds.length === 0) {
                return new SuccessResponse([]);
            }
            const getRootGroups = [];
            for (const id of groupIds) {
                getRootGroups.push(
                    this.treeDBService.searchTree(
                        Group,
                        id,
                        groupListDropdownAttributes as (keyof Group)[],
                    ),
                );
            }
            const response = await Promise.all(getRootGroups);
            return new SuccessResponse(response);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
