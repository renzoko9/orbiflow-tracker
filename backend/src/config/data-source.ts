import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as entities from '@Entities';

// El CLI de TypeORM no pasa por el ConfigModule de Nest, asi que cargamos el
// .env aqui. En entornos != development usamos el .env.<NODE_ENV>.
const envFile =
  process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
    ? `.env.${process.env.NODE_ENV}`
    : '.env';
config({ path: envFile });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: Object.values(entities),
  migrations: [join(__dirname, '../database/migrations/*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
