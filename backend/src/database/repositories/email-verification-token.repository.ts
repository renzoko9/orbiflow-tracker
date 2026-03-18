import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';

@Injectable()
export class EmailVerificationTokenRepository extends Repository<EmailVerificationToken> {
  constructor(private dataSource: DataSource) {
    super(EmailVerificationToken, dataSource.createEntityManager());
  }
}
