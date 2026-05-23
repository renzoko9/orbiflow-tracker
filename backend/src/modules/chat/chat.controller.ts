import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ChatService } from './chat.service';
import { SendMessageRequest } from './dto/send-message.dto';
import {
  ConversationResponse,
  SendMessageResponse,
} from './models/chat-response.model';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const chatImageStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'chat'),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const rand = Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `chat-${ts}-${rand}${ext}`);
  },
});

@Controller('chat')
@UseGuards(JwtAccessGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation')
  async getConversation(
    @User('id') userId: number,
  ): Promise<ConversationResponse> {
    return this.chatService.getConversation(userId);
  }

  @Delete('conversation')
  async deleteConversation(@User('id') userId: number): Promise<void> {
    await this.chatService.deleteConversation(userId);
  }

  @Post('messages')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: chatImageStorage,
      limits: { fileSize: MAX_IMAGE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
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
  async sendMessage(
    @User('id') userId: number,
    @Body() body: SendMessageRequest,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<SendMessageResponse> {
    return this.chatService.sendMessage(userId, body.content, image);
  }
}
