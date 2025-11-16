import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/database/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<User>): Promise<User> {
    return this.usersService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<User>): Promise<User> {
    return this.usersService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(+id);
  }
}
