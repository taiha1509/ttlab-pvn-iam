import * as Joi from 'joi';
import {
    INPUT_TEXT_MAX_LENGTH,
    ARRAY_MAX_LENGTH,
    Regex,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

export class PermissionDto {
    actionId: number;
    resourceId: number;
}

export class CreateRoleDto {
    name: string;
    permissionIds: number[];
    description: string;
    createdBy?: number;
}

export const createRoleSchema = Joi.object().keys({
    name: Joi.string()
        .trim()
        .replace(/\s\s+/g, ' ')
        .regex(Regex.TEXT_WITHOUT_SPECIAL_CHARACTERS)
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('role.fields.name'),
    description: Joi.string()
        .required()
        .allow(null, '')
        .max(TEXTAREA_MAX_LENGTH)
        .label('role.fields.description'),
    permissionIds: Joi.array()
        .unique()
        .items(Joi.number().positive().required())
        .max(ARRAY_MAX_LENGTH)
        .required()
        .label('role.fields.permission'),
});
