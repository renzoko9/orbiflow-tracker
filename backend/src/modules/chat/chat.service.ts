import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IsNull } from 'typeorm';
import {
  AccountRepository,
  CategoryRepository,
  ChatConversationRepository,
  ChatMessageRepository,
  UserRepository,
} from '@Repositories';
import { ChatConversation } from '@Entities';
import { TransactionTypeEnum } from '@Enums';
import {
  LLMChatMessage,
  LLMContentBlock,
  LLMTextBlock,
  LLM_PROVIDER,
} from '../ai/providers/llm.provider';
import type { LLMProvider } from '../ai/providers/llm.provider';
import { CHAT_TOOLS, ChatToolsService } from './services/chat-tools.service';
import { ChatMapper } from './chat.mapper';
import {
  ChatActionTaken,
  ConversationResponse,
  SendMessageResponse,
} from './models/chat-response.model';

const HISTORY_LIMIT = 20;
const MAX_TOOL_ITERATIONS = 5;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LLMProvider,
    private readonly conversationRepo: ChatConversationRepository,
    private readonly messageRepo: ChatMessageRepository,
    private readonly userRepo: UserRepository,
    private readonly accountRepo: AccountRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly chatTools: ChatToolsService,
    private readonly mapper: ChatMapper,
  ) {}

  async getConversation(userId: number): Promise<ConversationResponse> {
    const conversation = await this.getOrCreateConversation(userId);
    const messages = await this.messageRepo.find({
      where: { conversation: { id: conversation.id } },
      order: { createdAt: 'ASC' },
    });
    return { messages: messages.map((m) => this.mapper.toResponse(m)) };
  }

  async deleteConversation(userId: number): Promise<void> {
    const conversation = await this.conversationRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!conversation) return;
    await this.conversationRepo.remove(conversation);
  }

  async sendMessage(
    userId: number,
    content: string | undefined,
    imageUrl: string | null = null,
  ): Promise<SendMessageResponse> {
    const trimmed = (content ?? '').trim();
    if (!trimmed && !imageUrl) {
      throw new BadRequestException({
        message: 'El mensaje debe tener texto o una imagen.',
      });
    }

    const conversation = await this.getOrCreateConversation(userId);

    const userMessage = await this.messageRepo.save(
      this.messageRepo.create({
        conversation: { id: conversation.id },
        role: 'user',
        content: trimmed,
        imageUrl,
      }),
    );

    const systemPrompt = await this.buildSystemPrompt(userId);
    const history = await this.loadHistoryForLLM(conversation.id);
    const newUserContent = this.buildUserContent(trimmed, imageUrl);
    const localMessages: LLMChatMessage[] = [
      ...history,
      { role: 'user', content: newUserContent },
    ];

    const photos = imageUrl ? [imageUrl] : [];
    const actionsTaken: ChatActionTaken[] = [];
    let assistantText = '';

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await this.llm.generate({
        systemPrompt,
        messages: localMessages,
        tools: CHAT_TOOLS,
        maxTokens: 1024,
      });

      if (!response.toolUse) {
        assistantText = response.text?.trim() ?? '';
        break;
      }

      const toolResult = await this.chatTools.execute(
        userId,
        response.toolUse.name,
        response.toolUse.input,
        photos,
      );

      if (
        response.toolUse.name === 'create_transaction' &&
        toolResult.ok &&
        toolResult.transactionId
      ) {
        actionsTaken.push({
          type: 'create_transaction',
          transactionId: toolResult.transactionId,
        });
      }

      const assistantBlocks: LLMContentBlock[] = [];
      if (response.text) {
        assistantBlocks.push({ type: 'text', text: response.text });
      }
      assistantBlocks.push({
        type: 'tool_use',
        id: response.toolUse.id,
        name: response.toolUse.name,
        input: response.toolUse.input,
      });
      localMessages.push({ role: 'assistant', content: assistantBlocks });
      localMessages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            toolUseId: response.toolUse.id,
            content: JSON.stringify(
              toolResult.ok
                ? toolResult.data
                : { error: toolResult.error ?? 'unknown' },
            ),
            isError: !toolResult.ok,
          },
        ],
      });
    }

    if (!assistantText) {
      assistantText =
        actionsTaken.length > 0
          ? 'Listo, lo registre.'
          : 'No pude completar la accion, intenta de nuevo.';
    }

    const assistantMessage = await this.messageRepo.save(
      this.messageRepo.create({
        conversation: { id: conversation.id },
        role: 'assistant',
        content: assistantText,
        imageUrl: null,
      }),
    );

    await this.conversationRepo.update(conversation.id, {
      updatedAt: new Date(),
    });

    return {
      userMessage: this.mapper.toResponse(userMessage),
      assistantMessage: this.mapper.toResponse(assistantMessage),
      actionsTaken,
    };
  }

  private buildUserContent(
    text: string,
    imageUrl: string | null,
  ): string | LLMContentBlock[] {
    if (!imageUrl) return text;
    const blocks: LLMContentBlock[] = [];
    if (text) blocks.push({ type: 'text', text } as LLMTextBlock);
    blocks.push({
      type: 'image',
      source: { type: 'url', url: imageUrl },
    });
    return blocks;
  }

  private async loadHistoryForLLM(
    conversationId: number,
  ): Promise<LLMChatMessage[]> {
    const recent = await this.messageRepo.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'DESC' },
      take: HISTORY_LIMIT,
    });
    return recent.reverse().map<LLMChatMessage>((m) => ({
      role: m.role,
      content: m.imageUrl
        ? `${m.content || '(sin texto)'} [imagen adjunta]`
        : m.content,
    }));
  }

  private async buildSystemPrompt(userId: number): Promise<string> {
    const [user, accounts, categories] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.accountRepo.find({
        where: { user: { id: userId }, archivedAt: IsNull() },
      }),
      this.categoryRepo
        .createQueryBuilder('cat')
        .where('cat.archived_at IS NULL')
        .andWhere('(cat.user_id = :userId OR cat.user_id IS NULL)', { userId })
        .orderBy('cat.name', 'ASC')
        .getMany(),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const userName = user?.name ?? 'usuario';

    const accountLines = accounts.length
      ? accounts
          .map(
            (a) => `- id=${a.id} | ${a.name} (balance: ${Number(a.balance)})`,
          )
          .join('\n')
      : '- (sin cuentas activas)';

    const categoryLines = categories.length
      ? categories
          .map((c) => {
            const tipo =
              c.type === TransactionTypeEnum.Income ? 'ingreso' : 'gasto';
            return `- id=${c.id} | ${c.name} (${tipo})`;
          })
          .join('\n')
      : '- (sin categorias disponibles)';

    return [
      'Sos Otto, el asistente financiero personal de INOUT.',
      'Tu rol es ayudar al usuario a registrar y consultar sus movimientos financieros (gastos e ingresos).',
      '',
      'REGLAS ESTRICTAS:',
      '1. SOLO respondes sobre las finanzas del usuario logueado. Si te preguntan otra cosa (clima, recetas, etc.), redirige con "Solo te puedo ayudar con tus finanzas." No respondas la pregunta.',
      '2. Antes de CREAR cualquier movimiento, SIEMPRE pedi confirmacion explicita con una respuesta de texto que detalle: monto, tipo (gasto/ingreso), categoria, cuenta y fecha. Ejemplo: "Voy a registrar un GASTO de S/20 en Transporte desde Cuenta Principal con fecha 2026-05-22. Confirmas?". Solo llama create_transaction cuando el usuario diga "si", "dale", "confirmo" o equivalente.',
      '3. Si el usuario manda una foto, analizala para extraer monto, fecha, comercio y proponer la transaccion. Nunca crees sin confirmar.',
      '4. Si falta info critica (cuenta o categoria), pregunta primero. NUNCA inventes accountId o categoryId.',
      '5. Hablas en espanol neutro, tono cercano y conciso. No uses emojis.',
      '6. Para crear, los campos son: amount (numero positivo), type (1 ingreso, 2 gasto), description, accountId, categoryId, date (YYYY-MM-DD).',
      '7. Si el usuario no especifica fecha al registrar, usa la fecha de hoy.',
      '',
      `CONTEXTO DEL USUARIO:`,
      `Nombre: ${userName}`,
      `Fecha de hoy: ${today}`,
      '',
      'Cuentas activas:',
      accountLines,
      '',
      'Categorias disponibles:',
      categoryLines,
    ].join('\n');
  }

  private async getOrCreateConversation(
    userId: number,
  ): Promise<ChatConversation> {
    let conversation = await this.conversationRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!conversation) {
      conversation = await this.conversationRepo.save(
        this.conversationRepo.create({ user: { id: userId } }),
      );
    }
    return conversation;
  }
}
