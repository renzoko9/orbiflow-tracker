import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginRequest } from './dto/login.dto';
import { ResponseAPI } from '@/common/interfaces/response.interface';
import { LoginResponse } from '@/modules/auth/models/login.model';
import * as bcrypt from 'bcrypt';
import { RegisterRequest } from './dto/register.dto';
import { RegisterResponse } from './models/register.model';
import { TipoRespuestaEnum } from '@/common/enum/tipo-respuesta.enum';
import { JwtProvider } from '@/common/providers/jwt/jwt.provider';
import { JwtUtil } from '@/common/utils/jwt.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtProvider: JwtProvider,
  ) {}

  async login(request: LoginRequest): Promise<ResponseAPI<LoginResponse>> {
    const user = await this.usersService.findOneByAnyField({
      email: request.email,
    });

    if (!user) throw new UnauthorizedException('Email inválido');

    const match = await bcrypt.compare(request.password, user.password);

    if (!match) throw new UnauthorizedException('Contraseña inválida');

    const tokens = await this.jwtProvider.generateTokens(user);

    return {
      tipoRespuesta: TipoRespuestaEnum.Success,
      message: 'Inicio de sesión exitoso',
      data: {
        usuario: JwtUtil.sanitizeUser(user),
        tokens,
      },
    };
  }

  async register(
    request: RegisterRequest,
  ): Promise<ResponseAPI<RegisterResponse>> {
    const existingUser = await this.usersService.findOneByAnyField({
      email: request.email,
    });

    if (existingUser) throw new BadRequestException('El email ya está en uso');

    const hashPassword = await bcrypt.hash(request.password, 10);

    const newUser = await this.usersService.create({
      name: request.name,
      lastname: request.lastname,
      email: request.email,
      password: hashPassword,
    });

    return {
      tipoRespuesta: TipoRespuestaEnum.Success,
      message: 'Usuario registrado exitosamente',
      data: { user: JwtUtil.sanitizeUser(newUser) },
    };
  }
}
