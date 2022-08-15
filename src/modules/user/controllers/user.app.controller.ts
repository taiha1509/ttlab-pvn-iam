import {
    Controller,
    Get,
    Post,
    Body,
    InternalServerErrorException,
    Query,
    Param,
    ParseIntPipe,
    Delete,
    Req,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    createUserSchema,
    updateUserSchema,
    userQuerySchema,
    UserTypes,
} from '../user.constant';
import { CreateUserDto, UpdateUserDto } from '../dto/request/create-user.dto';
import { UserService } from '../services/user.database.service';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { DatabaseService } from 'src/common/services/database.service';
import { User } from '../entity/user.entity';
import { Role } from '../../role/entity/role.entity';
import { UserSendgridService } from '../services/user.sendgrid.service';
import { UserQueryDto } from '../dto/request/get-user.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { AuthService } from '../../auth/services/auth.service';
import {
    HttpStatus,
    ModuleNames,
    Permissions,
    ROUTE_PREFIX_APP,
} from 'src/common/constants';
import { CVMCameraService } from 'src/modules/cvm/camera/camera.service';
import { CVMCameraGroupService } from 'src/modules/cvm/camera-group/camera-group.service';
import { CVMUserService } from 'src/modules/cvm/user/user.service';
import { Group } from 'src/modules/user-group/entity/group.entity';
import {
    PermissionActions,
    PermissionResources,
} from 'src/modules/role/role.constants';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trim.body.pipe';
@Controller(`${ROUTE_PREFIX_APP}/user`)
@UseGuards(JwtGuard, RoleGuard)
export class UserAppController {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
        private readonly userSendgridService: UserSendgridService,
        private readonly authService: AuthService,
        private readonly cameraService: CVMCameraService,
        private readonly cameraGroupService: CVMCameraGroupService,
        private readonly cvmUserService: CVMUserService,
    ) {}

    private readonly logger = createWinstonLogger(
        ModuleNames.USER,
        this.configService,
    );

    @Get()
    @Permissions(
        `${PermissionResources.USER}_${PermissionActions.READ}`,
        `${PermissionResources.USER_GROUP}_${PermissionActions.READ}`,
    )
    async getUserList(
        @Query(
            new JoiValidationPipe(userQuerySchema),
            new RemoveEmptyQueryPipe(),
        )
        query: UserQueryDto,
    ) {
        try {
            const userList = await this.userService.getUserList(query);
            return new SuccessResponse(userList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions(`${PermissionResources.USER}_${PermissionActions.CREATE}`)
    async createUser(
        @Req() req,
        @Body(new JoiValidationPipe(createUserSchema), new TrimBodyPipe())
        body: CreateUserDto,
    ) {
        try {
            const [
                isCameraIdsValid,
                isCameraGroupIdsValid,
                existedUsername,
                validRole,
                validGroupId,
            ] = await Promise.all([
                this.cameraService.validateCameraIds(body.cameraIds),
                this.cameraGroupService.validateCameraGroupIds(
                    body.cameraGroupIds,
                ),
                this.databaseService.checkItemExisted(
                    User,
                    body.username,
                    'username',
                ),
                this.databaseService.checkIdsExist(Role, body.roleIds),
                this.databaseService.checkIdsExist(Group, body.groupIds),
            ]);

            if (!isCameraIdsValid) {
                const message = await this.i18n.t(
                    'user.message.invalid.cameraIds',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'cameraIds',
                        message,
                    },
                ]);
            }
            if (!isCameraGroupIdsValid) {
                const message = await this.i18n.t(
                    'user.message.invalid.cameraGroupList',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'cameraGroupIds',
                        message,
                    },
                ]);
            }

            if (existedUsername) {
                const message = await this.i18n.t(
                    'user.message.existed.username',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        key: 'username',
                        message,
                    },
                ]);
            }
            if (!validRole) {
                const message = await this.i18n.t(
                    'user.message.notExisted.roleIds',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_NOT_EXISTED,
                        key: 'roleIds',
                        message,
                    },
                ]);
            }

            if (!validGroupId) {
                const message = await this.i18n.t(
                    'group.errors.groupsNotExist',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_NOT_EXISTED,
                        key: 'groupIds',
                        message: `${message}, id = ${body.groupIds}`,
                    },
                ]);
            }

            if (body.email) {
                const existedEmail =
                    await this.databaseService.checkItemExisted(
                        User,
                        body.email,
                        'email',
                    );
                if (existedEmail) {
                    const message = await this.i18n.t(
                        'user.message.existed.email',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                            key: 'email',
                            message,
                        },
                    ]);
                }
            }

            if (body.phoneNumber) {
                const existedPhoneNumber =
                    await this.databaseService.checkItemExisted(
                        User,
                        body.phoneNumber,
                        'phoneNumber',
                    );
                if (existedPhoneNumber) {
                    const message = await this.i18n.t(
                        'user.message.existed.phoneNumber',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                            key: 'phoneNumber',
                            message,
                        },
                    ]);
                }
            }

            body.createdBy = req.loginUser.id;
            body.updatedBy = req.loginUser.id;

            const newUser = await this.userService.insertUserToDB(body);
            // call vms api to insert this user information to camera and group
            try {
                const response = await Promise.all([
                    this.cameraService.updateCamerasManagedByUser(
                        newUser.id,
                        body.cameraIds,
                    ),
                    this.cameraGroupService.updateCameraGroupsManagedByUser(
                        newUser.id,
                        body.cameraGroupIds,
                    ),
                ]);
                if (!response[0]?.success || !response[1]?.success) {
                    const message = await this.i18n.t('common.errors.cvm');
                    this.logger.debug(
                        `error when call CVM api, response: ${JSON.stringify(
                            response,
                        )}`,
                    );
                    return new ErrorResponse(HttpStatus.CVM_ERROR, message);
                }
                // TODO rollback insert user
            } catch (error) {
                throw new InternalServerErrorException(error);
            }

            if (body.email) {
                this.userService.sendEmailInvitation(newUser.id);
            }

            // TODO verify by OPT

            return new SuccessResponse(newUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions(`${PermissionResources.USER}_${PermissionActions.UPDATE}`)
    async updateUser(
        @Req() req,
        @Body(new JoiValidationPipe(updateUserSchema), new TrimBodyPipe())
        body: UpdateUserDto,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const [isCameraIdsValid, isCameraGroupIdsValid, user, validRole] =
                await Promise.all([
                    this.cameraService.validateCameraIds(body.cameraIds),
                    this.cameraGroupService.validateCameraGroupIds(
                        body.cameraGroupIds,
                    ),
                    this.userService.getUserDetail(id),
                    this.databaseService.checkIdsExist(Role, body.roleIds),
                ]);
            if (!isCameraIdsValid) {
                const message = await this.i18n.t(
                    'user.message.invalid.cameraIds',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'cameraIds',
                        message,
                    },
                ]);
            }
            if (!isCameraGroupIdsValid) {
                const message = await this.i18n.t(
                    'user.message.invalid.cameraGroupList',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'cameraGroupIds',
                        message,
                    },
                ]);
            }
            if (!user) {
                const message = await this.i18n.t(
                    'user.message.notExisted.userId',
                );
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            if (!validRole) {
                const message = await this.i18n.t(
                    'user.message.notExisted.roleIds',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_NOT_EXISTED,
                        key: 'roleIds',
                        message,
                    },
                ]);
            }

            if (body.groupIds.length > 0) {
                const validGroupId = await this.databaseService.checkIdsExist(
                    Group,
                    body.groupIds,
                );
                if (!validGroupId) {
                    const message = await this.i18n.t(
                        'user.message.notExisted.groupIds',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_NOT_EXISTED,
                            key: 'groupIds',
                            message,
                        },
                    ]);
                }
            }

            if (body.email) {
                const existedEmail =
                    await this.databaseService.checkItemExisted(
                        User,
                        body.email,
                        'email',
                        id,
                    );
                if (existedEmail) {
                    const message = await this.i18n.t(
                        'user.message.existed.email',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                            key: 'email',
                            message,
                        },
                    ]);
                }
            }

            if (body.phoneNumber) {
                const existedPhoneNumber =
                    await this.databaseService.checkItemExisted(
                        User,
                        body.phoneNumber,
                        'phoneNumber',
                        id,
                    );
                if (existedPhoneNumber) {
                    const message = await this.i18n.t(
                        'user.message.existed.phoneNumber',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                            key: 'phoneNumber',
                            message,
                        },
                    ]);
                }
            }
            if (
                user.types.includes(UserTypes.DEVICE_ADMIN) ||
                user.types.includes(UserTypes.SYSTEM_ADMIN)
            ) {
                const message = await this.i18n.t(
                    'user.message.update.superAdmin',
                );
                return new ErrorResponse(
                    HttpStatus.FORBIDDEN_MODIFY_SUPER_ADMIN,
                    message,
                );
            }
            // call vms api to insert this user information to camera and group
            try {
                const response = await Promise.all([
                    this.cameraService.updateCamerasManagedByUser(
                        id,
                        body.cameraIds,
                    ),
                    this.cameraGroupService.updateCameraGroupsManagedByUser(
                        id,
                        body.cameraGroupIds,
                    ),
                ]);
                if (!response[0]?.success || !response[1]?.success) {
                    const message = await this.i18n.t('common.errors.cvm');
                    this.logger.debug(
                        `error when call CVM api, data: ${JSON.stringify(
                            response,
                        )}`,
                    );
                    // TODO rollback update user
                    return new ErrorResponse(HttpStatus.CVM_ERROR, message);
                }
            } catch (error) {
                throw new InternalServerErrorException(error);
            }

            body.updatedBy = req.loginUser.id;
            const updatedUser = await this.userService.updateUser(id, body);
            return new SuccessResponse(updatedUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions(`${PermissionResources.USER}_${PermissionActions.READ}`)
    async getUser(@Param('id', ParseIntPipe) id: number) {
        try {
            const user = await this.userService.getUserDetail(id);
            if (!user) {
                const message = await this.i18n.t(
                    'user.message.notExisted.userId',
                );
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            if (user) {
                // get cameras and group cameras of this user
                const response =
                    await this.cvmUserService.getAdditionalUserInformation(id);
                if (!response?.success) {
                    const message = await this.i18n.t('common.errors.cvm');
                    this.logger.debug(
                        `error when call CVM api, data: ${JSON.stringify(
                            response,
                        )}`,
                    );
                    return new ErrorResponse(HttpStatus.CVM_ERROR, message);
                }
                user.cameras = response.data?.cameras || [];
                user.cameraGroups = response.data?.cameraGroups || [];
            }
            return new SuccessResponse(user);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions(`${PermissionResources.USER}_${PermissionActions.DELETE}`)
    async deleteUser(@Req() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const { id: loginUserId } = req.loginUser;
            if (id === loginUserId) {
                const message = await this.i18n.t(
                    'user.message.invalid.deleteYourSelf',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'id',
                        message,
                    },
                ]);
            }
            const user = await this.userService.getUserDetail(id);
            if (!user) {
                const message = await this.i18n.t(
                    'user.message.notExisted.userId',
                );
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }

            if (
                user.types.includes(UserTypes.DEVICE_ADMIN) ||
                user.types.includes(UserTypes.SYSTEM_ADMIN)
            ) {
                const message = await this.i18n.t(
                    'user.message.delete.superAdmin',
                );
                return new ErrorResponse(
                    HttpStatus.FORBIDDEN_MODIFY_SUPER_ADMIN,
                    message,
                );
            }

            const deleted = await this.userService.deleteUser(id, loginUserId);

            if (deleted) {
                try {
                    const response = await Promise.all([
                        this.cameraService.unlinkUserWithCamera(id),
                        this.cameraGroupService.unlinkUserWithCameraGroup(id),
                    ]);
                    // TODO rollback deleted data when call cvm is error
                    if (!response[0]?.success || !response[1]?.success) {
                        const message = await this.i18n.t('common.errors.cvm');
                        this.logger.debug(
                            `error when call CVM api, data: ${JSON.stringify(
                                response,
                            )}`,
                        );
                        return new ErrorResponse(HttpStatus.CVM_ERROR, message);
                    }
                } catch (error) {
                    throw new InternalServerErrorException(error);
                }
            }
            return new SuccessResponse();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
