import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { iamUserListQuerySchema } from '../user.constant';
import { UserService } from '../services/user.database.service';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { SuccessResponse } from 'src/common/helpers/response';
import { DatabaseService } from 'src/common/services/database.service';
import { UserSendgridService } from '../services/user.sendgrid.service';
import { IamUserQueryDto } from '../dto/request/get-user.dto';
import { AuthService } from '../../auth/services/auth.service';
import { ModuleNames, ROUTE_PREFIX_BACKEND } from 'src/common/constants';
import { UserIAMService } from '../services/user.iam.database.service';
import { Auth0Guard } from 'src/common/guards/auth0.guard';

@Controller(`${ROUTE_PREFIX_BACKEND}/user`)
@UseGuards(Auth0Guard)
export class UserIAMController {
    constructor(
        private readonly userService: UserService,
        private readonly userIAMService: UserIAMService,
        private readonly configService: ConfigService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
        private readonly userSendgridService: UserSendgridService,
        private readonly authService: AuthService,
    ) {}

    private readonly logger = createWinstonLogger(
        ModuleNames.USER,
        this.configService,
    );

    @Get()
    async getUserList(
        @Query(new JoiValidationPipe(iamUserListQuerySchema))
        query: IamUserQueryDto,
    ) {
        try {
            const userList = await this.userIAMService.getUserList(query.ids);
            return new SuccessResponse(userList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
