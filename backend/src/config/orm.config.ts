import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as entities from '@Entities';

export function typeOrmConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    // entities: [join(__dirname, '../database/entities/*.entity.{ts,js}')],
    entities: Object.values(entities),
    synchronize: true,
  };
}
