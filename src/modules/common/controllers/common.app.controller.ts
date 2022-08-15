import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ROUTE_PREFIX_APP } from 'src/common/constants';
import { SuccessResponse } from 'src/common/helpers/response';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { User } from '../../user/entity/user.entity';
import {
    QueryDropdownDto,
    queryDropdownSchema,
} from '../dto/request/dropdownDto';
import { CommonDropdownService } from '../services/common-dropdown.service';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';

@Controller(`${ROUTE_PREFIX_APP}/common`)
@UseGuards(JwtGuard)
export class CommonAppController {
    constructor(
        private readonly commonDropdownService: CommonDropdownService,
    ) {}

    @Get('/users')
    async getUsers(
        @Query(
            new JoiValidationPipe(queryDropdownSchema),
            new RemoveEmptyQueryPipe(),
        )
        query: QueryDropdownDto,
    ) {
        try {
            const data: User[] = await this.commonDropdownService.getListUser(
                query,
            );
            return new SuccessResponse(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
