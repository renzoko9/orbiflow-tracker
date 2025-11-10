import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
// import * as entities from '@Entities';

export function typeOrmConfig(): TypeOrmModuleOptions {
  const isProduction = process.env.MODE_ENV === 'prod';

  const entities = isProduction
    ? [join(__dirname, '/../**/*.entity.ts')]
    : [join(__dirname, '/../**/*.entity.ts')];

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities,
    synchronize: true,
  };
}
