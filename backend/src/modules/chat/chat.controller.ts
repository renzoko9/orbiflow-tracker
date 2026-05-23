import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageRequest } from './dto/send-message.dto';
import {
  ConversationResponse,
  SendMessageResponse,
} from './models/chat-response.model';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';

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
  async sendMessage(
    @User('id') userId: number,
    @Body() body: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    return this.chatService.sendMessage(userId, body.content);
  }
}
