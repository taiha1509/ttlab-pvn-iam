import { type } from "os";

export class CreateGroupDto {
    parentId: number;
    name: string;
    createdBy?: number;
    updatedBy?: number;
    level?: number;
}

export class UpdateGroupDto {
    name: string;
    createdBy?: number;
    updatedBy?: number;
}

export class QueryGroupDto {
    keyword?: string;
}
export class ICreateGroup extends CreateGroupDto {
    createdBy: number;
    updatedBy: number;
    level: number;
}

export class IAMGroupQueryDto {
    ids: number[];
}

export type IAMGetUserInGroupDto = IAMGroupQueryDto;
