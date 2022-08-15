import * as dotenv from 'dotenv';
dotenv.config();
const {
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_DATABASE,
    DATABASE_HOST,
    DATABASE_PORT,
} = process.env;

export const DatabaseConfig = [
    {
        type: 'mysql',
        // driver: 'mysql',
        database: DATABASE_DATABASE,
        port: parseInt(DATABASE_PORT) || 3306,
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        host: DATABASE_HOST,
        socketPath: null,
        synchronize: false,
        migrationsRun: false,
        migrations: ['database/migration/*.ts', 'database/seedings/*{.ts,.js}'],
        cli: { migrationsDir: 'database/migration' },
    },
];

export default DatabaseConfig;
