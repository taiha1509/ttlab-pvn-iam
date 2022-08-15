import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    UseGuards,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { ROUTE_PREFIX_BACKEND } from 'src/common/constants';
import { Auth0Guard } from 'src/common/guards/auth0.guard';
import { SuccessResponse } from 'src/common/helpers/response';
import { DatabaseService } from 'src/common/services/database.service';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { IAMGetUserInGroupDto, IAMGroupQueryDto } from '../dto/request.dto';
import { iamGroupQuerySchema } from '../group.constants';
import { GroupService } from '../services/group.database.service';
import { GroupIAMService } from '../services/group.iam.database.service';

@Controller(`${ROUTE_PREFIX_BACKEND}/user-group`)
@UseGuards(Auth0Guard)
export class GroupIAMController {
    constructor(
        private readonly commonDBService: DatabaseService,
        private readonly treeDBService: TreeDBService,
        private readonly groupService: GroupService,
        private readonly groupIAMService: GroupIAMService,
        private readonly i18n: I18nRequestScopeService,
    ) {}
    @Get('children-ids-in-tree')
    async getListUserIdsInGroupTree(
        @Query(new JoiValidationPipe(iamGroupQuerySchema))
        query: IAMGetUserInGroupDto,
    ) {
        try {
            const result = await this.groupIAMService.getIdsInGroupTreeByIds(
                query.ids,
            );

            return new SuccessResponse(result);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('')
    async getListGroup(
        @Query(new JoiValidationPipe(iamGroupQuerySchema))
        query: IAMGroupQueryDto,
    ) {
        try {
            const groups = await this.groupIAMService.getGroupList(query.ids);
            return new SuccessResponse(groups);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
