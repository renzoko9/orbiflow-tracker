import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtProvider } from '@/common/jwt/jwt.provider';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from '@/common/jwt/access-token/jwt-access.strategy';
import { JwtRefreshStrategy } from '@/common/jwt/refresh-token/jwt-refresh.strategy';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    UsersModule,
    AccountsModule,
    JwtModule.register({
      // global: true,
      secret: process.env.JWT_SECRET || 'default_secret_key',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtProvider, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
