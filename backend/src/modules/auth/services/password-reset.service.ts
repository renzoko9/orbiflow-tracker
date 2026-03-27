import { Injectable, Logger } from '@nestjs/common';
import { randomInt, createHash } from 'crypto';
import { PasswordResetTokenRepository } from '@Repositories';
import { MailProvider } from '@/common/providers/mail/mail.provider';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly tokenExpiryHours: number = 1;

  constructor(
    private readonly mailProvider: MailProvider,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  async createAndSendResetToken(
    userId: number,
    email: string,
    name: string,
  ): Promise<void> {
    await this.deleteTokensByUserId(userId);

    const code = this.generateResetCode();
    const hashedCode = this.hashToken(code);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.tokenExpiryHours);

    this.logger.log('Creando token de restablecimiento de contraseña...');
    await this.passwordResetTokenRepository.save({
      token: hashedCode,
      expiresAt,
      userId,
    });

    await this.mailProvider.sendMail({
      to: email,
      subject: 'Restablece tu contraseña - OrbiFlow',
      template: 'reset-password',
      context: { name, code, year: new Date().getFullYear() },
    });
  }

  async verifyToken(token: string) {
    const hashedToken = this.hashToken(token);
    return this.passwordResetTokenRepository.findOne({
      where: { token: hashedToken },
      relations: ['user'],
    });
  }

  async deleteTokensByUserId(userId: number): Promise<void> {
    await this.passwordResetTokenRepository.delete({ userId });
  }

  private generateResetCode(): string {
    return randomInt(100000, 999999).toString();
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
