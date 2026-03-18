import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import { EmailVerificationTokenRepository } from '@Repositories';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly TOKEN_EXPIRY_HOURS = 24;

  constructor(
    private readonly mailerService: MailerService,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
  ) {}

  async createAndSendVerificationToken(
    userId: number,
    email: string,
    name: string,
  ): Promise<void> {
    const code = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

    this.logger.log('Creando token de verificación...');
    await this.emailVerificationTokenRepository.save({
      token: code,
      expiresAt,
      userId,
    });

    await this.sendVerificationEmail(email, name, code);
  }

  async verifyToken(token: string) {
    return this.emailVerificationTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async deleteTokensByUserId(userId: number): Promise<void> {
    await this.emailVerificationTokenRepository.delete({ userId });
  }

  private generateVerificationCode(): string {
    return randomInt(100000, 999999).toString();
  }

  private async sendVerificationEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    this.logger.log(`Enviando correo de verificación a ${email}`);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verifica tu cuenta - OrbiFlow',
      template: 'verify-email',
      context: {
        name,
        code,
        year: new Date().getFullYear(),
      },
    });

    this.logger.log(`Correo de verificación enviado a ${email}`);
  }
}
