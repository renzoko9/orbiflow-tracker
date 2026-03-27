import {
  BadRequestException,
  ForbiddenException,
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
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtProvider: JwtProvider,
    private readonly accountsService: AccountsService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  async login(request: LoginRequest): Promise<ResponseAPI<LoginResponse>> {
    const { email, password } = request;

    this.logger.log('Obteniendo usuario...');
    const user = await this.usersService.findOneByAnyField({ email });
    this.logger.log('Usuario obtenido');

    if (!user) throw new UnauthorizedException('Este email no está registrado');

    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new UnauthorizedException('Contraseña inválida');

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Debes verificar tu correo electrónico antes de iniciar sesión',
      );
    }

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

    await this.emailVerificationService.createAndSendVerificationToken(
      newUser.id,
      newUser.email,
      newUser.name,
    );

    return {
      responseType: ResponseTypeEnum.Success,
      message: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.',
      data: { user: JwtUtil.sanitizeUser(newUser) },
    };
  }

  async verifyEmail(token: string): Promise<ResponseAPI> {
    const verificationToken = await this.emailVerificationService.verifyToken(token);

    if (!verificationToken) {
      throw new BadRequestException('Token de verificación inválido');
    }

    if (verificationToken.expiresAt < new Date()) {
      await this.emailVerificationService.deleteTokensByUserId(verificationToken.user.id);
      throw new BadRequestException(
        'El token de verificación ha expirado. Solicita uno nuevo.',
      );
    }

    await this.usersService.update(verificationToken.user.id, {
      isVerified: true,
    });

    await this.emailVerificationService.deleteTokensByUserId(verificationToken.user.id);

    this.logger.log(
      `Usuario ${verificationToken.user.email} verificado exitosamente`,
    );

    return {
      responseType: ResponseTypeEnum.Success,
      message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.',
    };
  }

  async resendVerification(email: string): Promise<ResponseAPI> {
    const user = await this.usersService.findOneByAnyField({ email });

    // Respuesta genérica para no revelar si el email existe
    const genericMessage =
      'Si el correo está registrado y no verificado, recibirás un enlace de verificación.';

    if (!user || user.isVerified) {
      return {
        responseType: ResponseTypeEnum.Success,
        message: genericMessage,
      };
    }

    await this.emailVerificationService.deleteTokensByUserId(user.id);
    await this.emailVerificationService.createAndSendVerificationToken(
      user.id,
      user.email,
      user.name,
    );

    return {
      responseType: ResponseTypeEnum.Success,
      message: genericMessage,
    };
  }

  async forgotPassword(email: string): Promise<ResponseAPI> {
    const user = await this.usersService.findOneByAnyField({ email });

    const genericMessage =
      'Si el correo está registrado, recibirás un código para restablecer tu contraseña.';

    if (!user) {
      return {
        responseType: ResponseTypeEnum.Success,
        message: genericMessage,
      };
    }

    await this.passwordResetService.createAndSendResetToken(
      user.id,
      user.email,
      user.name,
    );

    return {
      responseType: ResponseTypeEnum.Success,
      message: genericMessage,
    };
  }

  async verifyResetCode(token: string): Promise<ResponseAPI> {
    const resetToken = await this.passwordResetService.verifyToken(token);

    if (!resetToken) {
      throw new BadRequestException('Código de restablecimiento inválido');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.passwordResetService.deleteTokensByUserId(resetToken.user.id);
      throw new BadRequestException(
        'El código ha expirado. Solicita uno nuevo.',
      );
    }

    return {
      responseType: ResponseTypeEnum.Success,
      message: 'Código verificado correctamente.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<ResponseAPI> {
    const resetToken = await this.passwordResetService.verifyToken(token);

    if (!resetToken) {
      throw new BadRequestException('Código de restablecimiento inválido');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.passwordResetService.deleteTokensByUserId(resetToken.user.id);
      throw new BadRequestException(
        'El código ha expirado. Solicita uno nuevo.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.update(resetToken.user.id, {
      password: hashedPassword,
    });

    await this.passwordResetService.deleteTokensByUserId(resetToken.user.id);

    this.logger.log(
      `Contraseña restablecida para ${resetToken.user.email}`,
    );

    return {
      responseType: ResponseTypeEnum.Success,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.',
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
