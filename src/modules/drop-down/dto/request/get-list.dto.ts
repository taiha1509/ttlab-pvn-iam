import * as Joi from 'joi';
import { MAX_PAGE_LIMIT, MAX_PAGE_VALUE } from 'src/common/constants';
export class QueryListDropdownDto {
    page?: number;
    limit?: number;
}

export const queryListDropdownSchema = Joi.object().keys({
    limit: Joi.number()
        .max(MAX_PAGE_LIMIT)
        .optional()
        .label('common.fields.limit'),
    page: Joi.number()
        .max(MAX_PAGE_VALUE)
        .optional()
        .label('common.fields.limit'),
});
