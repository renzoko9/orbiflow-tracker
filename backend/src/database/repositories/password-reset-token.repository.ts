import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository extends Repository<PasswordResetToken> {
  constructor(private dataSource: DataSource) {
    super(PasswordResetToken, dataSource.createEntityManager());
  }
}
