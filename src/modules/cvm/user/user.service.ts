import { Injectable } from '@nestjs/common';
import { IBodyResponse } from 'src/common/interfaces';
import { AxiosService } from 'src/common/services/axios.service';
import { CVMUserResponseDto } from './dto/response.dto';

@Injectable()
export class CVMUserService extends AxiosService {
    baseUrl = 'user';

    async getAdditionalUserInformation(
        id: number,
    ): Promise<IBodyResponse<CVMUserResponseDto>> {
        return await this.client.get(`${this.baseUrl}/${id}`);
    }
}
