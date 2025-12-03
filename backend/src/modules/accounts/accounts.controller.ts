import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';
import { Account } from '@/database/entities/account.entity';

@Controller('accounts')
@UseGuards(JwtAccessGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @User('id') userId: number,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountsService.create(userId, createAccountDto);
  }

  @Get()
  findAll(@User('id') userId: number): Promise<Account[]> {
    return this.accountsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @User('id') userId: number,
  ): Promise<Account> {
    return this.accountsService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @User('id') userId: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountsService.update(+id, userId, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('id') userId: number): Promise<void> {
    return this.accountsService.delete(+id, userId);
  }
}
