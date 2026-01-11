import { User } from '@domain/entities/User';
import { AuthResponseDTO } from '../api/dto/AuthDTO';

export class UserMapper {
  static toDomain(dto: AuthResponseDTO['data']): User {
    if (!dto || !dto.user) throw new Error('Invalid DTO');

    return new User(
      dto.user.id,
      dto.user.email,
      dto.user.name,
      new Date(dto.user.createdAt)
    );
  }

  static userToDomain(userDto: any): User {
    if (!userDto) throw new Error('Invalid user DTO');

    return new User(
      userDto.id,
      userDto.email,
      userDto.name,
      new Date(userDto.createdAt)
    );
  }
}
