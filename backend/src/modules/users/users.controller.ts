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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { unlink } from 'fs/promises';
import { UsersService } from './users.service';
import { UpdateProfileRequest } from './dto/update-profile.dto';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';
import { JwtUtil } from '@/common/utils/jwt.utils';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const avatarStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const rand = Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar-${ts}-${rand}${ext}`);
  },
});

async function safeUnlinkAvatar(relativeUrl: string | null): Promise<void> {
  if (!relativeUrl) return;
  try {
    await unlink(join(process.cwd(), relativeUrl));
  } catch {
    // archivo ya no existe o no se puede borrar; no es critico
  }
}

@Controller('users')
@UseGuards(JwtAccessGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@User('id') userId: number) {
    const user = await this.usersService.findOne(userId);
    return JwtUtil.sanitizeUser(user);
  }

  @Patch('me')
  async updateMe(
    @User('id') userId: number,
    @Body() data: UpdateProfileRequest,
  ) {
    const user = await this.usersService.updateProfile(userId, data);
    return JwtUtil.sanitizeUser(user);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarStorage,
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

    const newUrl = `/uploads/avatars/${file.filename}`;
    const { user, previousAvatarUrl } = await this.usersService.updateAvatarUrl(
      userId,
      newUrl,
    );

    if (previousAvatarUrl && previousAvatarUrl !== newUrl) {
      await safeUnlinkAvatar(previousAvatarUrl);
    }

    return JwtUtil.sanitizeUser(user);
  }

  @Delete('me/avatar')
  async deleteAvatar(@User('id') userId: number) {
    const { user, previousAvatarUrl } = await this.usersService.updateAvatarUrl(
      userId,
      null,
    );

    await safeUnlinkAvatar(previousAvatarUrl);

    return JwtUtil.sanitizeUser(user);
  }
}
