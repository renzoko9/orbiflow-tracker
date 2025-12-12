import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginRequest } from './dto/login.dto';
import { ResponseAPI } from '@/common/interfaces/response.interface';
import { LoginResponse } from '@/modules/auth/models/login.model';
import * as bcrypt from 'bcrypt';
import { RegisterRequest } from './dto/register.dto';
import { RegisterResponse } from './models/register.model';
import { ResponseTypeEnum } from '@/common/enum/response-type.enum';
import { JwtProvider } from '@/common/jwt/jwt.provider';
import { JwtUtil } from '@/common/utils/jwt.utils';
import { TokenPayload } from '@/common/interfaces/auth/payload.interface';
import { LoginTokensResponse } from '@/common/models/tokens.model';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtProvider: JwtProvider,
    private readonly accountsService: AccountsService,
  ) {}

  async login(request: LoginRequest): Promise<ResponseAPI<LoginResponse>> {
    const { email, password } = request;

    this.logger.log('Obteniendo usuario...');
    const user = await this.usersService.findOneByAnyField({
      email,
    });
    this.logger.log('Usuario obtenido');

    if (!user) throw new UnauthorizedException('Este email no está registrado');

    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new UnauthorizedException('Contraseña inválida');

    this.logger.log('Generando tokens...');
    const tokens = await this.jwtProvider.generateTokens(user);
    this.logger.log('Tokens generados');

    const refreshTokenHash = await bcrypt.hash(tokens.refresh!, 10);

    await this.usersService.update(user.id, {
      refreshToken: refreshTokenHash,
    });

    return {
      responseType: ResponseTypeEnum.Success,
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
    this.logger.log('Verificando si el email ya está en uso...');
    const existingUser = await this.usersService.findOneByAnyField({
      email: request.email,
    });
    this.logger.log('Verificación completada');

    if (existingUser) throw new BadRequestException('El email ya está en uso');

    const hashPassword = await bcrypt.hash(request.password, 10);

    this.logger.log('Creando nuevo usuario...');
    const newUser = await this.usersService.create({
      name: request.name,
      lastname: request.lastname,
      email: request.email,
      password: hashPassword,
    });
    this.logger.log('Usuario creado exitosamente');

    this.logger.log('Creando cuenta por defecto...');
    await this.accountsService.create(newUser.id, {
      name: 'Cuenta Principal',
      description: 'Cuenta inicial',
      balance: 0,
    });
    this.logger.log('Cuenta por defecto creada');

    return {
      responseType: ResponseTypeEnum.Success,
      message: 'Usuario registrado exitosamente',
      data: { user: JwtUtil.sanitizeUser(newUser) },
    };
  }

  async refreshTokens(refreshToken: string): Promise<LoginTokensResponse> {
    const payload: TokenPayload =
      await this.jwtProvider.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findOne(payload.id);

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken!);

    if (!isMatch) throw new UnauthorizedException('Token inválido');

    const tokens = await this.jwtProvider.generateTokens(user);

    const refreshTokenHash = await bcrypt.hash(tokens.refresh!, 10);

    await this.usersService.update(user.id, {
      refreshToken: refreshTokenHash,
    });

    return tokens;
  }
}
