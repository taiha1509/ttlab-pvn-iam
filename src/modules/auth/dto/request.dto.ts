import * as Joi from 'joi';
import {
    INPUT_TEXT_MAX_LENGTH,
    MIN_PASSWORD_LENGTH,
    Regex,
    TOKEN_MAX_LENGTH,
} from 'src/common/constants';
import { TokenType } from '../auth.constant';

export class LoginDto {
    credential: string;
    password: string;
}

export class ForgotPasswordDto {
    email: string | null;
}
export class ResetPasswordDto {
    password: string;
    token: string;
}
export class VerifyTokenDto {
    type: string;
    token: string;
}

export const forgotPasswordSchema = Joi.object().keys({
    email: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .trim()
        .replace(/\s\s+/g, ' ')
        .regex(new RegExp(Regex.EMAIL), 'user.errors.email.misMatch')
        .required()
        .label('user.fields.email'),
});
export const resetPasswordSchema = Joi.object().keys({
    password: Joi.string()
        .required()
        .regex(Regex.PASSWORD)
        .label('auth.fields.password'),
    token: Joi.string().required().label('user.fields.token'),
});
export const verifyTokenSchema = Joi.object().keys({
    token: Joi.string()
        .max(TOKEN_MAX_LENGTH)
        .required()
        .label('user.fields.token'),
    type: Joi.string()
        .valid(...Object.values(TokenType))
        .required()
        .label('user.fields.tokenType'),
});
export const loginSchema = Joi.object().keys({
    credential: Joi.string()
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('auth.fields.username'),
    password: Joi.string()
        .required()
        .regex(Regex.PASSWORD)
        .label('auth.fields.password'),
});

export const updatePasswordSchema = Joi.object().keys({
    oldPassword: Joi.string()
        .required()
        .trim()
        .replace(/\s\s+/g, ' ')
        .regex(Regex.PASSWORD)
        .label('auth.fields.oldPassword'),
    newPassword: Joi.string()
        .required()
        .trim()
        .replace(/\s\s+/g, ' ')
        .regex(Regex.PASSWORD)
        .invalid(Joi.ref('oldPassword'))
        .label('auth.fields.newPassword'),
});
export class ActiveUserDto {
    token: string;
}

export class UpdatePasswordDto {
    oldPassword: string;
    newPassword: string;
    updatedBy?: number;
}

export class ResendEmailInvitationDto {
    userId: number;
}

export class UpdateProfileDto {
    fullName: string | null;
    phoneNumber?: string | null;
    updatedBy?: number;
}

class DynamicTemplateForgotPassword {
    subject: string;
    fullName!: string;
    urlWebapp: string;
}

export class EmailForgotPasswordDto {
    to: string;
    from: string;
    templateId: string;
    dynamicTemplateData: DynamicTemplateForgotPassword;
}
