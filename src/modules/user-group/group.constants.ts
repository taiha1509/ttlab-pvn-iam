import * as Joi from 'joi';
import {
    INPUT_TEXT_MAX_LENGTH,
    ARRAY_MAX_LENGTH,
    MIN_ID,
    Regex,
} from 'src/common/constants';
import { Group } from './entity/group.entity';

const baseGroupSchema = Joi.object().keys({
    name: Joi.string()
        .trim()
        .replace(/\s\s+/g, ' ')
        .regex(new RegExp(Regex.TEXT_WITHOUT_SPECIAL_CHARACTERS))
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('group.fields.name'),
});

export const createGroupSchema = baseGroupSchema.append({
    parentId: Joi.number()
        .required()
        .allow(null)
        .min(MIN_ID)
        .label('group.fields.parentId'),
});

export const iamGroupQuerySchema = Joi.object().keys({
    ids: Joi.array()
        .unique()
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.number().positive().required())
        .required(),
});

export const updateGroupSchema = baseGroupSchema.append({});

export const listGroupAttributes: (keyof Group)[] = [
    'id',
    'name',
    'level',
    'parentId',
];

export const maxLevel = 4;

export enum GroupOrderBy {
    CREATED_AT = 'createdAt',
    NAME = 'name',
}

export const queryGroupSchema = Joi.object().keys({
    keyword: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .allow('', null)
        .label('group.fields.keyword'),
});
