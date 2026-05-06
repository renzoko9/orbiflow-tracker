import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@Entities';
import { UserRepository } from '@Repositories';
import { FindOptionsWhere } from 'typeorm';
import { ErrorCodeEnum } from '@Enums';
import { UpdateProfileRequest } from './dto/update-profile.dto';

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
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
      });
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        message: `User with email ${email} not found`,
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
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

  async updateProfile(id: number, data: UpdateProfileRequest): Promise<User> {
    const user = await this.findOne(id);
    if (data.name !== undefined) user.name = data.name;
    if (data.lastname !== undefined) user.lastname = data.lastname;
    return this.userRepository.save(user);
  }

  async updateAvatarUrl(
    id: number,
    avatarUrl: string | null,
  ): Promise<{ user: User; previousAvatarUrl: string | null }> {
    const user = await this.findOne(id);
    const previousAvatarUrl = user.avatarUrl;
    user.avatarUrl = avatarUrl;
    const saved = await this.userRepository.save(user);
    return { user: saved, previousAvatarUrl };
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
