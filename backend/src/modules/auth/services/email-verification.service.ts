import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt, createHash } from 'crypto';
import { EmailVerificationTokenRepository } from '@Repositories';
import { MailProvider } from '@/common/providers/mail/mail.provider';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly tokenExpiryHours: number;

  constructor(
    private readonly mailProvider: MailProvider,
    private readonly configService: ConfigService,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
  ) {
    this.tokenExpiryHours = this.configService.get<number>(
      'TOKEN_EXPIRY_HOURS',
      24,
    );
  }

  async createAndSendVerificationToken(
    userId: number,
    email: string,
    name: string,
  ): Promise<void> {
    const code = this.generateVerificationCode();
    const hashedCode = this.hashToken(code);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.tokenExpiryHours);

    this.logger.log('Creando token de verificación...');
    await this.emailVerificationTokenRepository.save({
      token: hashedCode,
      expiresAt,
      userId,
    });

    await this.mailProvider.sendMail({
      to: email,
      subject: 'Verifica tu cuenta - OrbiFlow',
      template: 'verify-email',
      context: { name, code, year: new Date().getFullYear() },
    });
  }

  async verifyToken(token: string) {
    const hashedToken = this.hashToken(token);
    return this.emailVerificationTokenRepository.findOne({
      where: { token: hashedToken },
      relations: ['user'],
    });
  }

  async deleteTokensByUserId(userId: number): Promise<void> {
    await this.emailVerificationTokenRepository.delete({ userId });
  }

  private generateVerificationCode(): string {
    return randomInt(100000, 999999).toString();
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
