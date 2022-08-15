import { BaseQueryList } from 'src/common/constants';
import { UserOrderBy, UserStatus } from '../../user.constant';

export class UserQueryDto extends BaseQueryList {
    roleIds?: number[];
    groupIds?: number[];
    orderBy?: UserOrderBy | null;
    statuses?: UserStatus[];
}

export class IamUserQueryDto {
    ids: number[];
}
