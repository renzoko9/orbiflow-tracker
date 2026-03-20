import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { EmailVerificationTokenRepository } from '@Repositories';
import { SendMailOptions } from './interfaces/send-mail-options.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly tokenExpiryHours: number;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
  ) {
    this.tokenExpiryHours = this.configService.get<number>(
      'TOKEN_EXPIRY_HOURS',
      24,
    );
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    this.logger.log(`Enviando correo a ${options.to}`);

    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context,
    });

    this.logger.log(`Correo enviado a ${options.to}`);
  }

  async createAndSendVerificationToken(
    userId: number,
    email: string,
    name: string,
  ): Promise<void> {
    const code = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.tokenExpiryHours);

    this.logger.log('Creando token de verificación...');
    await this.emailVerificationTokenRepository.save({
      token: code,
      expiresAt,
      userId,
    });

    await this.sendMail({
      to: email,
      subject: 'Verifica tu cuenta - OrbiFlow',
      template: 'verify-email',
      context: { name, code, year: new Date().getFullYear() },
    });
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
}
