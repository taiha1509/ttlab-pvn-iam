import { Global, Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileLogger } from 'typeorm';
import ConfigKey from '../config/config-key';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const type = configService.get(ConfigKey.DATABASE_TYPE);
                const host = configService.get(ConfigKey.DATABASE_HOST);
                const port = configService.get(ConfigKey.DATABASE_PORT);
                const username = configService.get(ConfigKey.DATABASE_USERNAME);
                const password = configService.get(ConfigKey.DATABASE_PASSWORD);
                const database = configService.get(ConfigKey.DATABASE_DATABASE);
                return {
                    name: 'default',
                    type,
                    host,
                    port,
                    username,
                    password,
                    database,
                    logger: new FileLogger(
                        configService.get(ConfigKey.NODE_ENV) === 'development',
                        {
                            logPath: 'logs/query.log',
                        },
                    ),
                    autoLoadEntities: true,
                    entities: ['dist/**/*.entity{.ts,.js}'],
                };
            },
        }),
    ],
    providers: [],
    exports: [],
})
export class DatabaseModule {}
