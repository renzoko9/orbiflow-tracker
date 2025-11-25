import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtProvider } from '@/common/providers/jwt/jwt.provider';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default_secret_key',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtProvider],
})
export class AuthModule {}
