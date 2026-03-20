import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

export function mailConfig(): MailerAsyncOptions {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      transport: {
        host: config.get<string>('EMAIL_HOST'),
        port: config.get<number>('EMAIL_PORT'),
        secure: false,
        auth: {
          user: config.get<string>('EMAIL_USER'),
          pass: config.get<string>('EMAIL_PASSWORD'),
        },
      },
      defaults: {
        from: config.get<string>(
          'EMAIL_FROM',
          '"OrbiFlow" <noreply@orbiflow.com>',
        ),
      },
      template: {
        dir: join(__dirname, '..', 'common', 'providers', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  };
}
