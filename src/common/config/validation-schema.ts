import * as Joi from 'joi';
import ConfigKey from './config-key';

export default Joi.object({
    [ConfigKey.NODE_ENV]: Joi.string().default('development'),
    [ConfigKey.PORT]: Joi.number().default(3000),
    [ConfigKey.VERSION]: Joi.string().required(),
    [ConfigKey.DATABASE_TYPE]: Joi.string().default('mysql'),
    [ConfigKey.DATABASE_DATABASE]: Joi.string().required(),
    [ConfigKey.DATABASE_HOST]: Joi.string().required(),
    [ConfigKey.DATABASE_PORT]: Joi.number().default(3306),
    [ConfigKey.DATABASE_USERNAME]: Joi.string().required(),
    [ConfigKey.DATABASE_PASSWORD]: Joi.string().required(),
    [ConfigKey.CORS_WHITELIST]: Joi.string().required(),
    [ConfigKey.LOG_LEVEL]: Joi.string()
        .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
        .required(),
    [ConfigKey.TOKEN_PRIVATE_KEY]: Joi.string().required(),
    [ConfigKey.ACCESS_TOKEN_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.REFRESH_TOKEN_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.FORGOT_PASSWORD_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.SENDGRID_API_KEY]: Joi.string().required(),
    [ConfigKey.SENDGRID_ADMIN_EMAIL]: Joi.string().required(),
    [ConfigKey.SENDGRID_TEMPLATE_CREATE_NEW_USER]: Joi.string().required(),
    [ConfigKey.SENDGRID_TEMPLATE_FORGOT_PASSWORD]: Joi.string().required(),
    [ConfigKey.VUE_APP_RESET_PASSWORD_URL]: Joi.string().required(),
    [ConfigKey.CVM_API_URL]: Joi.string().required(),
    [ConfigKey.HTTP_TIMEOUT]: Joi.number().default(5000),
    [ConfigKey.HTTP_MAX_REDIRECTS]: Joi.number().default(5),
    [ConfigKey.AUTH0_DOMAIN]: Joi.string().required(),
    [ConfigKey.AUTH0_AUDIENCE]: Joi.string().required(),
    [ConfigKey.AUTH0_CVM_IAM_CLIENT_ID]: Joi.string().required(),
    [ConfigKey.AUTH0_CVM_IAM_CLIENT_SECRET]: Joi.string().required(),
});
