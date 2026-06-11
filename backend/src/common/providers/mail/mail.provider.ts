import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { SendMailOptions } from './interfaces/send-mail-options.interface';

const LOGO_CID = 'inout-logo';
const LOGO_PATH = join(__dirname, 'templates', 'assets', 'inout-logo.png');

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
      attachments: [
        {
          filename: 'inout-logo.png',
          path: LOGO_PATH,
          cid: LOGO_CID,
        },
      ],
    });

    this.logger.log(`Correo enviado a ${options.to}`);
  }
}
