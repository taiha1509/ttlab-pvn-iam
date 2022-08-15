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
    Req,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    HttpStatus,
    Permissions,
    ROUTE_PREFIX_APP,
} from 'src/common/constants';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from 'src/common/services/database.service';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trim.body.pipe';
import {
    permissionList,
    resourceList,
} from 'src/modules/common/services/global-data.service';
import { CreateRoleDto, createRoleSchema } from '../dto/request/createDto';
import { UpdateRoleDto, updateRoleSchema } from '../dto/request/updateDto';
import { Role } from '../entity/role.entity';
import { PermissionActions, PermissionResources } from '../role.constants';
import { RoleService } from '../services/role.database.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import * as _ from 'lodash';
import { UserRole } from '../entity/userRolesRelation.entity';
@UseGuards(JwtGuard, RoleGuard)
@Controller(`${ROUTE_PREFIX_APP}/role`)
export class RoleAppController {
    constructor(
        private readonly roleService: RoleService,
        private readonly configService: ConfigService,
        private readonly i18n: I18nRequestScopeService,
        private readonly commonService: DatabaseService,
    ) {}

    @Get('/permission')
    @Permissions(`${PermissionResources.ROLE}_${PermissionActions.READ}`)
    getAvailablePermission() {
        try {
            const permissionListGroupByResource = resourceList.map(
                (resource) => {
                    const actionList = permissionList
                        .filter(
                            (permission) =>
                                permission.resource?.content ===
                                resource.content,
                        )
                        .map((permission) => ({
                            action: permission.action?.content,
                            permissionId: permission.id,
                        }));
                    return {
                        actions: actionList,
                        resource: resource.content,
                    };
                },
            );
            // const permissionTemplate = _.groupBy();
            return new SuccessResponse({
                items: permissionListGroupByResource,
            });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('')
    @Permissions(`${PermissionResources.ROLE}_${PermissionActions.CREATE}`)
    async createRole(
        @Req() req,
        @Body(new JoiValidationPipe(createRoleSchema), new TrimBodyPipe())
        body: CreateRoleDto,
    ) {
        try {
            const existedName = await this.commonService.checkItemExisted(
                Role,
                body.name,
                'name',
            );
            const existedPermission =
                _.intersection(
                    permissionList.map((item) => item.id),
                    body.permissionIds,
                ).length === body.permissionIds.length;

            // validate name
            if (existedName) {
                const message = await this.i18n.t('role.message.existedName', {
                    args: { name: body.name },
                });
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        key: 'name',
                        message,
                    },
                ]);
            }

            // validate actionId and resourceId
            if (!existedPermission) {
                const message = await this.i18n.t(
                    'role.message.invalidPermission',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_NOT_EXISTED,
                        key: 'permissionIds',
                        message,
                    },
                ]);
            }
            body.createdBy = req.loginUser.id;
            const createdRole = await this.roleService.createRole(body);
            return new SuccessResponse(createdRole);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('')
    @Permissions(`${PermissionResources.ROLE}_${PermissionActions.READ}`)
    async getRoleList() {
        try {
            const roleList = await this.roleService.getRoleList();
            return new SuccessResponse(roleList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions(`${PermissionResources.ROLE}_${PermissionActions.READ}`)
    async getRole(@Param('id', ParseIntPipe) id: number) {
        try {
            const role = await this.roleService.getRole(id);
            if (!role) {
                const message = await this.i18n.t('role.message.roleNotExist');
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            return new SuccessResponse(role);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    @Patch(':id')
    @Permissions(`${PermissionResources.ROLE}_${PermissionActions.UPDATE}`)
    async updateRole(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(new JoiValidationPipe(updateRoleSchema), new TrimBodyPipe())
        body: UpdateRoleDto,
    ) {
        try {
            const [existedRole, existedName] = await Promise.all([
                this.commonService.checkItemExisted(Role, id),
                this.commonService.checkItemExisted(
                    Role,
                    body.name,
                    'name',
                    id,
                ),
            ]);

            if (!existedRole) {
                const message = await this.i18n.t('role.message.roleNotExist');
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            if (existedName) {
                const message = await this.i18n.t('role.message.existedName', {
                    args: { name: body.name },
                });
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        key: 'name',
                        message,
                    },
                ]);
            }

            const existedPermission =
                _.intersection(
                    permissionList.map((item) => item.id),
                    body.permissionIds,
                ).length === body.permissionIds.length;
            if (!existedPermission) {
                const message = await this.i18n.t(
                    'role.message.invalidPermission',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'actionId & resourceId',
                        message,
                    },
                ]);
            }
            body.updatedBy = req.loginUser.id;
            body.deletedBy = req.loginUser.id;
            const updatedRole = await this.roleService.updateRole(id, body);
            return new SuccessResponse(updatedRole);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    @Delete(':id')
    @Permissions(`${PermissionResources.ROLE}_${PermissionActions.DELETE}`)
    async deleteRole(@Param('id', ParseIntPipe) id: number, @Req() req) {
        try {
            const role = await this.roleService.getRole(id);
            if (!role) {
                const message = await this.i18n.t('role.message.roleNotExist');
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            // check if role is assign for any user
            const roleAssignToUser = await this.commonService.checkItemExisted(
                UserRole,
                role.id,
                'roleId',
            );
            if (roleAssignToUser) {
                const message = await this.i18n.t(
                    'role.message.roleAssignToUser',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'id',
                        message,
                    },
                ]);
            }
            await this.roleService.deleteRole(id, req.loginUser.id);
            return new SuccessResponse();
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}
