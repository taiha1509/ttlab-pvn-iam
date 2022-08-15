import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import ConfigKey from 'src/common/config/config-key';
import { UserResponseDto } from 'src/modules/user/dto/response/detail-user.dto';
import { SendgridSubject } from 'src/modules/user/user.constant';
import { EmailForgotPasswordDto } from '../dto/request.dto';

@Injectable()
export class SendgridService {
    constructor(private readonly configService: ConfigService) {}
    async sendEmailResetPassword(user: UserResponseDto, token: string) {
        try {
            const emailParam: EmailForgotPasswordDto = {
                from: this.configService.get(ConfigKey.SENDGRID_ADMIN_EMAIL),
                to: user.email,
                templateId: this.configService.get(
                    ConfigKey.SENDGRID_TEMPLATE_FORGOT_PASSWORD,
                ),
                dynamicTemplateData: {
                    fullName: user.fullName,
                    subject: SendgridSubject.FORGOT_PASSWORD,
                    urlWebapp: `${this.configService.get(
                        ConfigKey.VUE_APP_RESET_PASSWORD_URL,
                    )}?token=${token}`,
                },
            };

            sgMail.setApiKey(
                this.configService.get(ConfigKey.SENDGRID_API_KEY),
            );
            await sgMail.send(emailParam);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
