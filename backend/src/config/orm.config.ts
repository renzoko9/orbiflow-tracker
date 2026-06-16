import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';

// Reusa las mismas opciones que el DataSource del CLI de migraciones para que
// runtime y migraciones nunca diverjan. synchronize queda en false: el schema
// se gestiona solo con migraciones.
export function typeOrmConfig(): TypeOrmModuleOptions {
  return dataSourceOptions;
}
