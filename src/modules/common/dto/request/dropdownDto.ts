import * as Joi from 'joi';
import { UserStatus } from 'src/modules/user/user.constant';

export class QueryDropdownDto {
    status?: UserStatus[];
    withDeleted?: string;
}

export const queryDropdownSchema = Joi.object().keys({
    status: Joi.array()
        .items(Joi.string().valid(...Object.values(UserStatus)))
        .optional(),
    withDeleted: Joi.boolean().optional(),
});
