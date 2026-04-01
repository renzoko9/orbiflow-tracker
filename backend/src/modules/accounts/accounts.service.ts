import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Account } from 'src/database/entities/account.entity';
import { AccountRepository } from 'src/database/repositories/account.repository';
import { CreateAccountRequest } from './dto/create-account.dto';
import { UpdateAccountRequest } from './dto/update-account.dto';
import { ErrorCode } from '@/common/enum/error-code.enum';

@Injectable()
export class AccountsService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(
    userId: number,
    createAccountDto: CreateAccountRequest,
  ): Promise<Account> {
    const newAccount = this.accountRepository.create({
      ...createAccountDto,
      user: { id: userId },
      balance: createAccountDto.balance || 0,
    });
    return this.accountRepository.save(newAccount);
  }

  async findAll(userId: number): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user: { id: userId } },
      // relations: ['user'],
    });
  }

  async findOne(id: number, userId: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: userId } },
      // relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException({
        message: `Account with id ${id} not found`,
        errorCode: ErrorCode.ACCOUNT_NOT_FOUND,
      });
    }

    return account;
  }

  async update(
    id: number,
    userId: number,
    updateAccountDto: UpdateAccountRequest,
  ): Promise<Account> {
    const account = await this.findOne(id, userId);

    if (account.user.id !== userId) {
      throw new ForbiddenException({
        message: 'You can only update your own accounts',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
      });
    }

    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async delete(id: number, userId: number): Promise<void> {
    const account = await this.findOne(id, userId);

    if (account.user.id !== userId) {
      throw new ForbiddenException({
        message: 'You can only delete your own accounts',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
      });
    }

    await this.accountRepository.remove(account);
  }
}
