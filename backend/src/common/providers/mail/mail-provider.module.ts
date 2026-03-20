import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailProvider } from './mail.provider';
import { mailConfig } from '@/config/mail.config';

@Module({
  imports: [MailerModule.forRootAsync(mailConfig())],
  providers: [MailProvider],
  exports: [MailProvider],
})
export class MailProviderModule {}
