import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailOptions } from './interfaces/send-mail-options.interface';

@Injectable()
export class MailProvider {
  private readonly logger = new Logger(MailProvider.name);

  constructor(private readonly mailerService: MailerService) {}

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
}
