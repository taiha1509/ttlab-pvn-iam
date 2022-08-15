class DynamicTemplateUserInvitation {
    subject: string;
    username: string;
    fullName!: string;
    token: string;
    urlWebapp: string;
}

export class SendInvitationEmailDto {
    to: string;
    from: string;
    templateId: string;
    dynamicTemplateData: DynamicTemplateUserInvitation;
}
