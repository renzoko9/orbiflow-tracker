import { Module } from '@nestjs/common';
import { ModulesModule } from './modules/modules.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './config/orm.config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { StorageModule } from './common/providers/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
          ? [`.env.${process.env.NODE_ENV}`, '.env']
          : ['.env'],
    }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    ScheduleModule.forRoot(),
    StorageModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Tiempo en milisegundos (60 segundos)
        limit: 20, // Número máximo de peticiones permitidas en ese tiempo
      },
    ]),
    ModulesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
