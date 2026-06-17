import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChatService } from './chat.service';
import { SendMessageRequest } from './dto/send-message.dto';
import { GetConversationQuery } from './dto/get-conversation.query';
import {
  ConversationResponse,
  ResolveProposalResponse,
  SendMessageResponse,
} from './models/chat-response.model';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

@Controller('chat')
@UseGuards(JwtAccessGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation')
  async getConversation(
    @User('id') userId: number,
    @Query() query: GetConversationQuery,
  ): Promise<ConversationResponse> {
    return this.chatService.getConversation(userId, query.before, query.limit);
  }

  @Delete('conversation')
  async deleteConversation(@User('id') userId: number): Promise<void> {
    await this.chatService.deleteConversation(userId);
  }

  @Post('messages')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
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

  @Post('messages/:id/confirm')
  async confirmProposal(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) messageId: number,
  ): Promise<ResolveProposalResponse> {
    return this.chatService.confirmProposal(userId, messageId);
  }

  @Post('messages/:id/cancel')
  async cancelProposal(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) messageId: number,
  ): Promise<ResolveProposalResponse> {
    return this.chatService.cancelProposal(userId, messageId);
  }
}
