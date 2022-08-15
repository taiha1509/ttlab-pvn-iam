import { CreateRoleDto, createRoleSchema } from './createDto';

export class UpdateRoleDto extends CreateRoleDto {
    updatedBy?: number;
    deletedBy?: number;
}

export const updateRoleSchema = createRoleSchema;
