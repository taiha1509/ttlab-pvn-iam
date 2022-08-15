import { CVMCameraGroupDetailResponseDto } from '../../camera-group/dto/camera-group.dto';
import { CVMCameraDetailResponseDto } from '../../camera/dto/camera.dto';

export class CVMUserResponseDto {
    cameras: CVMCameraDetailResponseDto[];
    cameraGroups: CVMCameraGroupDetailResponseDto[];
}
