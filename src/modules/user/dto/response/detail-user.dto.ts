import { Group } from 'src/modules/user-group/entity/group.entity';
import { UserGroup } from 'src/modules/user-group/entity/userGroupsRelation.entity';
import { Role } from 'src/modules/role/entity/role.entity';
import { ActiveTypes, UserStatus, UserTypes } from '../../user.constant';
import { CVMCameraDetailResponseDto } from 'src/modules/cvm/camera/dto/camera.dto';
import { CVMCameraGroupDetailResponseDto } from 'src/modules/cvm/camera-group/dto/camera-group.dto';

export class UserResponseDto {
    id: number;
    fullName: string | null;
    email: string | null;
    phoneNumber: string | null;
    username: string;
    roles: Role[];
    groups: Group[];
    userGroups: UserGroup[];
    status: UserStatus;
    types: UserTypes[];
    activeTypes: ActiveTypes[];
    cameras: CVMCameraDetailResponseDto[];
    cameraGroups: CVMCameraGroupDetailResponseDto[];
}
