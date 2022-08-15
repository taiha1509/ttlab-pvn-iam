import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendInvitationEmailDto } from '../dto/request/send-email.dto';
import * as sgMail from '@sendgrid/mail';
import ConfigKey from 'src/common/config/config-key';
import { UserResponseDto } from '../dto/response/detail-user.dto';
import { SendgridSubject } from '../user.constant';

@Injectable()
export class UserSendgridService {
    async sendInvitationEmail(user: UserResponseDto, token: string) {
        try {
            const emailParam: SendInvitationEmailDto = {
                from: process.env[ConfigKey.SENDGRID_ADMIN_EMAIL],
                to: user.email,
                templateId:
                    process.env[ConfigKey.SENDGRID_TEMPLATE_CREATE_NEW_USER],
                dynamicTemplateData: {
                    fullName: user.fullName,
                    subject: SendgridSubject.CREATE_USER,
                    username: user.username,
                    token,
                    urlWebapp: `${
                        process.env[ConfigKey.VUE_APP_ACTIVE_USER_URL]
                    }?token=${token}`,
                },
            };
            sgMail.setApiKey(process.env[ConfigKey.SENDGRID_API_KEY]);
            const response = await sgMail.send(emailParam);
            return response;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }
}
