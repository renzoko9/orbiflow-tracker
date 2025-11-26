import { LoginTokensResponse } from '@/common/models/tokens.model';
import { User } from '@/database/entities';
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenPayload } from '../interfaces/auth/payload.interface';

@Injectable()
export class JwtProvider {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(user: User): Promise<LoginTokensResponse> {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_TIME || '15m',
    } as unknown as JwtSignOptions);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_TIME || '7d',
    } as unknown as JwtSignOptions);

    return {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  async verifyRefreshToken(refreshToken: string): Promise<TokenPayload> {
    return this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET,
    });
  }
}
