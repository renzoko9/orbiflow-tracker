import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { EmailVerificationTokenRepository } from '@Repositories';
import { mailConfig } from '@/config/mail.config';

@Module({
  imports: [MailerModule.forRootAsync(mailConfig())],
  providers: [MailService, EmailVerificationTokenRepository],
  exports: [MailService, EmailVerificationTokenRepository],
})
export class MailModule {}
