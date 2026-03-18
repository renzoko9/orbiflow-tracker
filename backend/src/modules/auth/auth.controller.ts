import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/login.dto';
import { ResponseAPI } from '@/common/interfaces/response.interface';
import { LoginResponse } from './models/login.model';
import { RegisterRequest } from './dto/register.dto';
import { RegisterResponse } from './models/register.model';
import { VerifyEmailRequest } from './dto/verify-email.dto';
import { ResendVerificationRequest } from './dto/resend-verification.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() data: LoginRequest): Promise<ResponseAPI<LoginResponse>> {
    return this.authService.login(data);
  }

  @Post('register')
  async register(
    @Body() data: RegisterRequest,
  ): Promise<ResponseAPI<RegisterResponse>> {
    return this.authService.register(data);
  }

  @Post('verify-email')
  async verifyEmail(@Body() data: VerifyEmailRequest): Promise<ResponseAPI> {
    return this.authService.verifyEmail(data.token);
  }

  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('resend-verification')
  async resendVerification(
    @Body() data: ResendVerificationRequest,
  ): Promise<ResponseAPI> {
    return this.authService.resendVerification(data.email);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshTokens(token);
  }
}
