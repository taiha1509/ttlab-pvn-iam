import {
    Injectable,
    InternalServerErrorException,
    Scope,
} from '@nestjs/common';
import {
    IBodyResponse,
    IDataList,
    IDeleteResponseDto,
} from 'src/common/interfaces';
import { CVMCameraGroupDetailResponseDto } from './dto/camera-group.dto';
import { AxiosService } from 'src/common/services/axios.service';

@Injectable({ scope: Scope.REQUEST })
export class CVMCameraGroupService extends AxiosService {
    baseUrl = 'camera-group';

    async getCameraGroupList(
        cameraGroupIds: string[],
    ): Promise<IBodyResponse<IDataList<CVMCameraGroupDetailResponseDto>>> {
        return await this.client.get(this.baseUrl, {
            params: { ids: cameraGroupIds },
        });
    }

    async unlinkUserWithCameraGroup(
        userId: number,
    ): Promise<IBodyResponse<IDeleteResponseDto[]>> {
        return await this.client.delete(`${this.baseUrl}/user/${userId}`);
    }

    async updateCameraGroupsManagedByUser(
        userId: number,
        cameraGroupIds: string[],
    ): Promise<IBodyResponse<void>> {
        return await this.client.patch(`${this.baseUrl}/user/${userId}`, {
            cameraGroupIds,
        });
    }

    async validateCameraGroupIds(cameraGroupIds: string[]): Promise<boolean> {
        // call cvm server to validate groupIds
        if (cameraGroupIds.length > 0) {
            try {
                const response = await this.getCameraGroupList(cameraGroupIds);
                if (response.success) {
                    if (
                        response?.data?.items?.length !== cameraGroupIds.length
                    ) {
                        // some cameraGroupList is invalid or not existed
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                throw new InternalServerErrorException();
            }
        }
        return true;
    }
}
