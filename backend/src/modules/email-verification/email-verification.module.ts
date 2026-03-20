import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationTokenRepository } from '@Repositories';
import { MailProviderModule } from '@/common/providers/mail/mail-provider.module';

@Module({
  imports: [ConfigModule, MailProviderModule],
  providers: [EmailVerificationService, EmailVerificationTokenRepository],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
