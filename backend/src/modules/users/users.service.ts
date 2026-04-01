import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/database/repositories/user.repository';
import { FindOptionsWhere } from 'typeorm';
import { ErrorCode } from '@/common/enum/error-code.enum';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException({
        message: `User with id ${id} not found`,
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        message: `User with email ${email} not found`,
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    }

    return user;
  }

  async findOneByAnyField(field: FindOptionsWhere<User>): Promise<User | null> {
    return await this.userRepository.findOne({ where: field });
  }

  async create(data: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(data);
    return this.userRepository.save(newUser);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
