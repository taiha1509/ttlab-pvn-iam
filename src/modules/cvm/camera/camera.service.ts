import {
    Injectable,
    InternalServerErrorException,
    Scope,
} from '@nestjs/common';
import { CVMCameraDetailResponseDto } from './dto/camera.dto';
import {
    IBodyResponse,
    IDataList,
    IDeleteResponseDto,
} from 'src/common/interfaces';
import { AxiosService } from 'src/common/services/axios.service';

@Injectable({ scope: Scope.REQUEST })
export class CVMCameraService extends AxiosService {
    baseUrl = 'camera';
    async getCameraList(
        cameraIds: string[],
    ): Promise<IBodyResponse<IDataList<CVMCameraDetailResponseDto[]>>> {
        return await this.client.get(this.baseUrl, {
            params: { ids: cameraIds },
        });
    }

    async unlinkUserWithCamera(
        userId: number,
    ): Promise<IBodyResponse<IDeleteResponseDto[]>> {
        return await this.client.delete(`${this.baseUrl}/user/${userId}`);
    }

    async unlinkUserGroupWithCamera(
        userGroupId: number,
    ): Promise<IBodyResponse<IDeleteResponseDto>> {
        return await this.client.delete(
            `${this.baseUrl}/user-group/${userGroupId}`,
        );
    }

    async updateCamerasManagedByUser(
        userId: number,
        cameraIds: string[],
    ): Promise<IBodyResponse<void>> {
        return await this.client.patch(`${this.baseUrl}/user/${userId}`, {
            cameraIds,
        });
    }

    async validateCameraIds(cameraIds: string[]): Promise<boolean> {
        // call cvm server to validate cameraIds
        if (cameraIds.length > 0) {
            try {
                const response = await this.getCameraList(cameraIds);
                if (response.success) {
                    if (response?.data?.items?.length !== cameraIds.length) {
                        // some cameraIds is invalid or not existed
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
