export class BaseUserDto {
    fullName: string | null;
    roleIds: number[];
    groupIds?: number[];
    cameraIds?: string[];
    cameraGroupIds?: string[];
    email?: string | null;
    phoneNumber?: string | null;
    createdBy?: number;
    updatedBy?: number;
}

export class CreateUserDto extends BaseUserDto {
    username: string;
    password: string;
}

export class UpdateUserDto extends BaseUserDto {}
