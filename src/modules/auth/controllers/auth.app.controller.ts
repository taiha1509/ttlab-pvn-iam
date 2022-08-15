import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    AllowedFirstLoginRoutes,
    HttpStatus,
    ModuleNames,
    ROUTE_PREFIX_APP,
} from 'src/common/constants';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from 'src/common/services/database.service';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { User } from '../../user/entity/user.entity';
import { UserService } from '../../user/services/user.database.service';
import { UserSendgridService } from '../../user/services/user.sendgrid.service';
import { UserStatus } from '../../user/user.constant';
import {
    activeUserSchema,
    resendEmailInvitationSchema,
    TokenType,
    updateProfileSchema,
} from '../auth.constant';
import {
    ActiveUserDto,
    ForgotPasswordDto,
    forgotPasswordSchema,
    LoginDto,
    loginSchema,
    ResendEmailInvitationDto,
    ResetPasswordDto,
    resetPasswordSchema,
    UpdatePasswordDto,
    updatePasswordSchema,
    UpdateProfileDto,
    VerifyTokenDto,
    verifyTokenSchema,
} from '../dto/request.dto';
import { UserToken } from '../entity/userToken.entity';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { TrimBodyPipe } from 'src/common/pipes/trim.body.pipe';
import ConfigKey from 'src/common/config/config-key';
import { SendgridService } from '../services/auth.sendgrid.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createWinstonLogger } from 'src/common/services/winston.service';
@Controller(`${ROUTE_PREFIX_APP}/auth`)
export class AuthAppController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly commonService: DatabaseService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
        private readonly userSendgridService: UserSendgridService,
        private readonly userService: UserService,
        private readonly profileService: ProfileService,
        private readonly authSendgridService: SendgridService,
    ) {}

    private readonly logger = createWinstonLogger(
        ModuleNames.AUTH,
        this.configService,
    );

    @Post('/login')
    @UseGuards(ThrottlerGuard)
    async login(@Body(new JoiValidationPipe(loginSchema)) data: LoginDto) {
        try {
            const user = await this.authService.checkCredential(
                data.credential,
            );
            if (!user) {
                const message = await this.i18n.t(
                    'auth.message.notExist.username',
                );
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message);
            }

            const isPasswordValid = await this.authService.checkPassword(
                user.password,
                data.password,
            );
            if (!isPasswordValid) {
                const message = await this.i18n.t(
                    'auth.message.invalidCredential',
                );
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message);
            }

            if (user.status !== UserStatus.ACTIVE) {
                const message = await this.i18n.t('auth.message.inactiveUser');
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message);
            }

            const result = await this.authService.login(user);

            return new SuccessResponse(result);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }


    @AllowedFirstLoginRoutes(true)
    @UseGuards(JwtGuard)
    @Post('/refresh-token')
    async refreshToken(@Req() req) {
        try {
            const { hashToken } = req.loginUser;
            const isHashTokenExist = await this.commonService.checkItemExisted(
                UserToken,
                hashToken,
                'hashToken',
            );
            if (!isHashTokenExist) {
                const message = await this.i18n.t('auth.message.unauthorized');
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message);
            }

            const result = await this.authService.refreshToken(req.loginUser);
            return new SuccessResponse(result);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtGuard)
    @Post('/logout')
    async logout(@Req() req) {
        try {
            await this.authService.logout(req.loginUser);
            return new SuccessResponse();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/verify-email-invitation')
    @UseGuards(ThrottlerGuard)
    async activeUser(
        @Body(new JoiValidationPipe(activeUserSchema)) data: ActiveUserDto,
    ) {
        try {
            let userData;
            try {
                userData = await this.authService.verifyEmailInvitationToken(
                    data.token,
                );
            } catch (error) {
                this.logger.debug(
                    `Error when verify active user token, data: ${JSON.stringify(
                        data,
                    )}`,
                );
                const messgae = await this.i18n.t('auth.message.invalidToken');
                return new ErrorResponse(HttpStatus.FORBIDDEN, messgae);
            }

            if (userData.exp * 1000 && userData.exp * 1000 < Date.now()) {
                const messgae = await this.i18n.t('auth.message.tokenExpired');
                return new ErrorResponse(HttpStatus.FORBIDDEN, messgae);
            }

            const activeToken = await this.authService.getToken({
                userId: userData.id,
                type: TokenType.EMAIL_INVITATION,
                hashToken: userData.hashToken,
            });

            if (!activeToken || activeToken.deletedAt) {
                const messgae = await this.i18n.t('auth.message.invalidToken');
                return new ErrorResponse(HttpStatus.FORBIDDEN, messgae);
            }
            await this.authService.activeUserAfterVerifyEmail(
                userData.id,
                data,
            );
            return new SuccessResponse();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtGuard)
    @Post('/resend-email-invitation')
    async resendActivateCode(
        @Body(new JoiValidationPipe(resendEmailInvitationSchema))
        data: ResendEmailInvitationDto,
    ) {
        try {
            const existedUser = await this.userService.getUserDetail(
                data.userId,
            );
            if (!existedUser) {
                const message = await this.i18n.t(
                    'user.message.notExisted.userId',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_NOT_EXISTED,
                        key: 'userId',
                        message,
                    },
                ]);
            }

            if (existedUser.status !== UserStatus.REGISTERING) {
                const message = await this.i18n.t(
                    'user.message.invalid.status',
                    {
                        args: { id: data.userId },
                    },
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'status',
                        message,
                    },
                ]);
            }

            const existedToken = await this.authService.getToken({
                type: TokenType.EMAIL_INVITATION,
                userId: data.userId,
            });

            if (existedToken) {
                // check user status
                // delete and generate new token
                // resend token

                this.userService.sendEmailInvitation(
                    existedUser.id,
                    existedToken.token,
                );
            }

            return new SuccessResponse();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @AllowedFirstLoginRoutes(true)
    @UseGuards(JwtGuard)
    @Get('/profile')
    async getUserProfile(@Req() req) {
        try {
            const loginUser = req.loginUser;
            const profile = await this.profileService.getProfile(loginUser.id);
            return new SuccessResponse(profile);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtGuard)
    @Patch('/profile')
    async updateUserProfile(
        @Req() req,
        @Body(new JoiValidationPipe(updateProfileSchema), new TrimBodyPipe())
        body: UpdateProfileDto,
    ) {
        try {
            const loginUser = req.loginUser;
            const existedUser = await this.databaseService.checkItemExisted(
                User,
                loginUser.id,
                'id',
                loginUser.id,
            );
            if (!existedUser) {
                const message = await this.i18n.t(
                    'user.message.notExisted.userId',
                );
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }

            if (body.phoneNumber) {
                const existedPhoneNumber =
                    await this.databaseService.checkItemExisted(
                        User,
                        body.phoneNumber,
                        'phoneNumber',
                        loginUser.id,
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

            body.updatedBy = loginUser.id;
            const profile = await this.profileService.updateProfile(
                loginUser.id,
                body,
            );
            return new SuccessResponse(profile);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    // for change password
    @AllowedFirstLoginRoutes(true)
    @UseGuards(JwtGuard)
    @Patch('/password')
    async updatepassword(
        @Req() req,
        @Body(new JoiValidationPipe(updatePasswordSchema))
        body: UpdatePasswordDto,
    ) {
        try {
            const loginUser = req.loginUser;
            const hashPassword = await this.authService.getHashPassword(
                loginUser.id,
            );
            if (!hashPassword) {
                const message = await this.i18n.t(
                    'user.message.notExisted.userId',
                );
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }

            body.updatedBy = loginUser.id;

            const verifyPassword = await this.authService.checkPassword(
                hashPassword,
                body.oldPassword,
            );

            if (!verifyPassword) {
                const message = await this.i18n.t(
                    'auth.message.invalidPassword',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_INVALID,
                        key: 'oldPassword',
                        message,
                    },
                ]);
            }

            await this.authService.updatePassword(body);
            return new SuccessResponse({});
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/forgot-password')
    @UseGuards(ThrottlerGuard)
    async forgotPassword(
        @Body(new JoiValidationPipe(forgotPasswordSchema))
        data: ForgotPasswordDto,
    ) {
        try {
            const user = await this.authService.findUserByEmail(data.email);
            // check exist user
            if (!user) {
                const message = await this.i18n.t(
                    'auth.message.notExist.email',
                );
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            // check user is active
            if (user.status !== UserStatus.ACTIVE) {
                const message = await this.i18n.t('auth.message.inactiveUser');
                return new ErrorResponse(HttpStatus.ITEM_INVALID, message);
            }

            const token = await this.authService.insertTokenInDB(user);
            // send email
            await this.authSendgridService.sendEmailResetPassword(user, token);
            return new SuccessResponse({});
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @AllowedFirstLoginRoutes(true)
    @Post('/reset-password')
    @UseGuards(ThrottlerGuard)
    async resetPassword(
        @Body(new JoiValidationPipe(resetPasswordSchema))
        data: ResetPasswordDto,
    ) {
        try {
            const { password, token } = data;
            const privateKey = this.configService
                .get(ConfigKey.TOKEN_PRIVATE_KEY)
                .replace(/\\n/g, '\n');
            let userToken = null;
            try {
                userToken = await jwt.verify(token, privateKey, {
                    ignoreExpiration: false,
                    algorithms: ['RS256'],
                });
            } catch (error) {
                const message = await this.i18n.t('auth.message.invalidToken');
                return new ErrorResponse(HttpStatus.TOKEN_INVALID, message);
            }

            const foundTokenInDB = await this.authService.findToken(
                userToken.hashToken,
            );
            // check existed token in db
            if (!foundTokenInDB) {
                const message = await this.i18n.t('auth.message.invalidToken');
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message);
            }

            const user = await this.authService.findUserById(userToken.id);
            // check user existed
            if (!user) {
                const message = await this.i18n.t(
                    'auth.message.notExist.username',
                );
                return new ErrorResponse(HttpStatus.ITEM_NOT_EXISTED, message);
            }
            await this.authService.resetPassword(
                user,
                password,
                foundTokenInDB,
            );
            return new SuccessResponse({});
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/verify-token')
    @UseGuards(ThrottlerGuard)
    async verifyToken(
        @Body(new JoiValidationPipe(verifyTokenSchema))
        data: VerifyTokenDto,
    ) {
        try {
            const { token, type } = data;
            const privateKey = this.configService
                .get(ConfigKey.TOKEN_PRIVATE_KEY)
                .replace(/\\n/g, '\n');
            let userToken = null;
            try {
                userToken = await jwt.verify(token, privateKey, {
                    ignoreExpiration: false,
                    algorithms: ['RS256'],
                });
            } catch (error) {
                const message = await this.i18n.t('auth.message.invalidToken');
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message);
            }

            const foundTokenInDB = await this.authService.findToken(
                userToken.hashToken,
                { type: type },
            );
            // check existed token in db
            if (!foundTokenInDB) {
                const message = await this.i18n.t('auth.message.invalidToken');
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message);
            }
            return new SuccessResponse({});
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
