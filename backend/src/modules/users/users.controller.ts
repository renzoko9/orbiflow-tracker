import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/database/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
