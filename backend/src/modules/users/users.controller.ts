import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { UpdateProfileRequest } from './dto/update-profile.dto';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';
import { JwtUtil } from '@/common/utils/jwt.utils';
import { StorageService } from '@/common/providers/storage/storage.service';
import { User as UserEntity } from '@/database/entities';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

@Controller('users')
@UseGuards(JwtAccessGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storage: StorageService,
  ) {}

  private async present(user: UserEntity) {
    const sanitized = JwtUtil.sanitizeUser(user);
    return {
      ...sanitized,
      avatarUrl: await this.storage.signOrNull(sanitized.avatarUrl),
    };
  }

  @Get('me')
  async getMe(@User('id') userId: number) {
    const user = await this.usersService.findOne(userId);
    return this.present(user);
  }

  @Patch('me')
  async updateMe(
    @User('id') userId: number,
    @Body() data: UpdateProfileRequest,
  ) {
    const user = await this.usersService.updateProfile(userId, data);
    return this.present(user);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AVATAR_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_AVATAR_MIMES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException({
              message: 'Formato no soportado. Usa JPG, PNG o WEBP.',
            }),
            false,
          );
        }
      },
    }),
  )
  async uploadAvatar(
    @User('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        message: 'No se recibio ningun archivo en el campo "avatar".',
      });
    }

    const key = this.storage.buildKey('avatars', file.originalname);
    await this.storage.upload(key, file.buffer, file.mimetype);

    const { user, previousAvatarUrl } = await this.usersService.updateAvatarUrl(
      userId,
      key,
    );

    if (previousAvatarUrl && previousAvatarUrl !== key) {
      await this.storage.delete(previousAvatarUrl);
    }

    return this.present(user);
  }

  @Delete('me/avatar')
  async deleteAvatar(@User('id') userId: number) {
    const { user, previousAvatarUrl } = await this.usersService.updateAvatarUrl(
      userId,
      null,
    );

    if (previousAvatarUrl) {
      await this.storage.delete(previousAvatarUrl);
    }

    return this.present(user);
  }
}
