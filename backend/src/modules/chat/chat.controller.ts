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
import { ChatMapper } from './chat.mapper';
import { SendMessageRequest } from './dto/send-message.dto';
import { GetConversationQuery } from './dto/get-conversation.query';
import {
  ConversationResponse,
  ResolveProposalResponse,
  SendMessageResponse,
} from './models/chat-response.model';
import {
  InboundImage,
  ProposalResolution,
} from './models/inbound-message.model';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';
import { ChatChannel } from '@Entities';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const CHANNEL: ChatChannel = 'in_app';

function toInboundImage(file: Express.Multer.File): InboundImage {
  return {
    buffer: file.buffer,
    originalName: file.originalname,
    mimeType: file.mimetype,
  };
}

@Controller('chat')
@UseGuards(JwtAccessGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly mapper: ChatMapper,
  ) {}

  @Get('conversation')
  async getConversation(
    @User('id') userId: number,
    @Query() query: GetConversationQuery,
  ): Promise<ConversationResponse> {
    const { messages, hasMore, nextCursor } =
      await this.chatService.getConversationMessages(
        userId,
        CHANNEL,
        query.before,
        query.limit,
      );
    return {
      messages: await Promise.all(
        messages.map((m) => this.mapper.toResponse(m)),
      ),
      hasMore,
      nextCursor,
    };
  }

  @Delete('conversation')
  async deleteConversation(@User('id') userId: number): Promise<void> {
    await this.chatService.deleteConversation(userId, CHANNEL);
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
    const exchange = await this.chatService.sendMessage(
      userId,
      CHANNEL,
      body.content,
      image ? toInboundImage(image) : undefined,
    );
    const [userMessage, assistantMessage] = await Promise.all([
      this.mapper.toResponse(exchange.userMessage),
      this.mapper.toResponse(exchange.assistantMessage),
    ]);
    return {
      userMessage,
      assistantMessage,
      actionsTaken: exchange.actionsTaken,
    };
  }

  @Post('messages/:id/confirm')
  async confirmProposal(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) messageId: number,
  ): Promise<ResolveProposalResponse> {
    const result = await this.chatService.confirmProposal(userId, messageId);
    return this.toResolveResponse(result);
  }

  @Post('messages/:id/cancel')
  async cancelProposal(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) messageId: number,
  ): Promise<ResolveProposalResponse> {
    const result = await this.chatService.cancelProposal(userId, messageId);
    return this.toResolveResponse(result);
  }

  private async toResolveResponse(
    result: ProposalResolution,
  ): Promise<ResolveProposalResponse> {
    const [proposal, followUp] = await Promise.all([
      this.mapper.toResponse(result.proposal),
      result.followUp ? this.mapper.toResponse(result.followUp) : null,
    ]);
    return { proposal, followUp, actionsTaken: result.actionsTaken };
  }
}
