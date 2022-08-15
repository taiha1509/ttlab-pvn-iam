import * as Joi from 'joi';
import {
    INPUT_TEXT_MAX_LENGTH,
    MIN_ID,
    Regex,
    TOKEN_MAX_LENGTH,
} from 'src/common/constants';

export const MIN_PASSWORD = 6;
export enum TokenType {
    REFRESH_TOKEN = 'refresh_token',
    EMAIL_INVITATION = 'email_invitation',
    FORGOT_PASSWORD = 'forgot_password',
}

export const activeUserSchema = Joi.object().keys({
    token: Joi.string()
        .max(TOKEN_MAX_LENGTH)
        .required()
        .label('user.fields.token'),
});

export const resendEmailInvitationSchema = Joi.object().keys({
    userId: Joi.number().min(MIN_ID).required().label('user.fields.userId'),
});

export const listUserAttributes = [
    'id',
    'fullName',
    'email',
    'phoneNumber',
    'status',
    'username',
    'activeTypes',
    'types',
    'firstLogin',
];

export const listUserQueryBuilderAttributes = [
    'user.id',
    'user.fullName',
    'user.email',
    'user.phoneNumber',
    'user.status',
    'user.username',
    'user.activeTypes',
    'user.types',
    'user.firstLogin',
];

export const updateProfileSchema = Joi.object().keys({
    fullName: Joi.string()
        .trim()
        .replace(/\s\s+/g, ' ')
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .regex(
            new RegExp(Regex.TEXT_WITHOUT_SPECIAL_CHARACTERS),
            'user.errors.fullName.misMatch',
        )
        .allow(null, '')
        .label('user.fields.fullName'),
    phoneNumber: Joi.string()
        .trim()
        .replace(/\s\s+/g, ' ')
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(new RegExp(Regex.PHONE), 'user.errors.phoneNumber.misMatch')
        .optional()
        .allow(null, '')
        .label('user.fields.phone'),
});
