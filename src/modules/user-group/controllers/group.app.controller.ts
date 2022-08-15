import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    HttpStatus,
    ModuleNames,
    Permissions,
    ROUTE_PREFIX_APP,
} from 'src/common/constants';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from 'src/common/services/database.service';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TreeDBService } from 'src/common/services/tree.database.service';
import { CVMCameraService } from 'src/modules/cvm/camera/camera.service';
import { IUserDecodeFromToken } from '../../auth/auth.type';
import {
    CreateGroupDto,
    QueryGroupDto,
    UpdateGroupDto,
} from '../dto/request.dto';
import { Group } from '../entity/group.entity';
import {
    createGroupSchema,
    maxLevel,
    queryGroupSchema,
    updateGroupSchema,
} from '../group.constants';
import { GroupService } from '../services/group.database.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import {
    PermissionActions,
    PermissionResources,
} from 'src/modules/role/role.constants';
import { TrimBodyPipe } from 'src/common/pipes/trim.body.pipe';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { ConfigService } from '@nestjs/config';

@Controller(`${ROUTE_PREFIX_APP}/user-group`)
@UseGuards(JwtGuard, RoleGuard)
export class GroupAppController {
    constructor(
        private readonly commonDBService: DatabaseService,
        private readonly treeDBService: TreeDBService,
        private readonly configService: ConfigService,
        private readonly groupService: GroupService,
        private readonly i18n: I18nRequestScopeService,
        private readonly cameraService: CVMCameraService,
    ) {}
    private readonly logger = createWinstonLogger(
        ModuleNames.USER_GROUP,
        this.configService,
    );
    @Get('')
    @Permissions(`${PermissionResources.USER_GROUP}_${PermissionActions.READ}`)
    async getListGroup(
        @Query(
            new JoiValidationPipe(queryGroupSchema),
            new RemoveEmptyQueryPipe(),
        )
        query: QueryGroupDto,
    ) {
        try {
            return new SuccessResponse(
                await this.groupService.getListGroups(query),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions(`${PermissionResources.USER_GROUP}_${PermissionActions.READ}`)
    async getGroup(@Param('id', ParseIntPipe) id: number) {
        try {
            const result = await this.groupService.getGroup(id);
            if (!result) {
                const message = await this.i18n.t('group.errors.groupNotExist');
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }

            return new SuccessResponse(result);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions(
        `${PermissionResources.USER_GROUP}_${PermissionActions.UPDATE}`,
    )
    async updateGroup(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(new JoiValidationPipe(updateGroupSchema), new TrimBodyPipe())
        body: UpdateGroupDto,
    ) {
        try {
            const existGroup = await this.groupService.getGroup(id);
            if (!existGroup) {
                const message = await this.i18n.t('group.errors.groupNotExist');
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            const isNameInvalid = await this.groupService.checkGroupNameExist(
                existGroup.parentId,
                body.name,
                id,
            );
            if (isNameInvalid) {
                const message = await this.i18n.t('group.errors.nameExist');

                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        key: 'name',
                        message,
                    },
                ]);
            }

            body.updatedBy = (req.loginUser as IUserDecodeFromToken).id;
            return new SuccessResponse(
                await this.groupService.updateGroup(body, id),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('')
    @Permissions(
        `${PermissionResources.USER_GROUP}_${PermissionActions.CREATE}`,
    )
    async createGroup(
        @Req() req,
        @Body(new JoiValidationPipe(createGroupSchema), new TrimBodyPipe())
        body: CreateGroupDto,
    ) {
        try {
            const user = req.loginUser as IUserDecodeFromToken;
            if (body.parentId) {
                const parentIdExisted =
                    await this.commonDBService.checkItemExisted(
                        Group,
                        body.parentId,
                        'id',
                    );
                if (!parentIdExisted) {
                    const message = await this.i18n.t(
                        'group.errors.parentNotExisted',
                    );

                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_NOT_EXISTED,
                            key: 'parentId',
                            message,
                        },
                    ]);
                }
            }

            const isNameInvalid = await this.groupService.checkGroupNameExist(
                body.parentId,
                body.name,
            );
            if (isNameInvalid) {
                const message = await this.i18n.t('group.errors.nameExist');

                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        key: 'name',
                        message,
                    },
                ]);
            }

            let parentLevel = 0;
            if (body.parentId) {
                parentLevel = await this.treeDBService.getLevel(
                    Group,
                    body.parentId,
                );
            }
            if (parentLevel >= maxLevel) {
                const message = await this.i18n.t('group.errors.maxLevel', {
                    args: { limit: maxLevel },
                });
                return new ErrorResponse(HttpStatus.GROUP_MAX_LEVEL, message);
            }
            return new SuccessResponse(
                await this.groupService.createGroup({
                    ...body,
                    level: parentLevel + 1,
                    createdBy: user.id,
                    updatedBy: user.id,
                }),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions(
        `${PermissionResources.USER_GROUP}_${PermissionActions.DELETE}`,
    )
    async deleteGroup(@Req() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const existGroup = await this.commonDBService.checkItemExisted(
                Group,
                id,
            );
            if (!existGroup) {
                const message = await this.i18n.t('group.errors.groupNotExist');
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }

            const hasChildren = await this.treeDBService.nodeHasChildren(
                Group,
                id,
            );
            if (hasChildren) {
                const message = await this.i18n.t('group.errors.groupHasChild');
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.GROUP_HAS_CHILDREN,
                        key: 'id',
                        message,
                    },
                ]);
            }
            await this.groupService.deleteGroup(
                id,
                (req.loginUser as IUserDecodeFromToken).id,
            );
            try {
                const response =
                    await this.cameraService.unlinkUserGroupWithCamera(id);
                if (!response?.success) {
                    const message = await this.i18n.t('common.errors.cvm');
                    this.logger.debug(
                        `error when call CVM api, data: ${JSON.stringify(
                            response,
                        )}`,
                    );
                    // TODO rollback deleted user
                    return new ErrorResponse(HttpStatus.CVM_ERROR, message);
                }
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
            return new SuccessResponse();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
