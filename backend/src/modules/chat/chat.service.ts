import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { In, IsNull, LessThan } from 'typeorm';
import {
  AccountRepository,
  CategoryRepository,
  ChatConversationRepository,
  ChatMessageRepository,
  UserRepository,
} from '@Repositories';
import { ChatChannel, ChatConversation, ChatMessage } from '@Entities';
import { TransactionTypeEnum } from '@Enums';
import {
  LLMChatMessage,
  LLMContentBlock,
  LLMTextBlock,
  LLM_PROVIDER,
} from '../ai/providers/llm.provider';
import type { LLMProvider } from '../ai/providers/llm.provider';
import { CHAT_TOOLS, ChatToolsService } from './services/chat-tools.service';
import { TransactionsService } from '../transactions/transactions.service';
import { StorageService } from '@/common/providers/storage/storage.service';
import { ChatProposalPayload } from './models/chat-response.model';
import {
  ChatExchange,
  InboundImage,
  ProposalResolution,
} from './models/inbound-message.model';

const HISTORY_LIMIT = 20;
const MAX_TOOL_ITERATIONS = 5;
const DEFAULT_PAGE_SIZE = 30;

// Detecta mensajes con intencion clara de registrar un movimiento (numero +
// verbo de gasto/ingreso, sin palabras interrogativas). Cuando matchea forzamos
// tool_choice='propose_transaction' para evitar que gpt-4o-mini responda con
// texto pidiendo confirmacion.
const TRANSACTION_VERBS =
  /\b(gast[eé]|pagu[eé]|compr[eé]|recib[ií]|cobr[eé]|ingres[eé]|deposit[eé]|retir[eé]|transfer[ií])\b/i;
const QUERY_WORDS =
  /\b(cu[aá]nt[oa]s?|qu[eé]|c[oó]mo|cu[aá]l(?:es)?|cu[aá]ndo|d[oó]nde|mu[eé]stra(?:me)?|mostrar|lista(?:r|me)?|dame|ver)\b/i;

function isTransactionIntent(text: string): boolean {
  if (!text) return false;
  if (text.includes('?')) return false;
  if (QUERY_WORDS.test(text)) return false;
  if (!/\d/.test(text)) return false;
  return TRANSACTION_VERBS.test(text);
}

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
    private readonly transactionsService: TransactionsService,
    private readonly storage: StorageService,
  ) {}

  async getConversationMessages(
    userId: number,
    channel: ChatChannel,
    before?: number,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor: number | null;
  }> {
    const conversation = await this.getOrCreateConversation(userId, channel);

    // Keyset pagination por id (descendente: del mas nuevo al mas viejo).
    // Pedimos limit + 1 para saber si quedan mensajes mas viejos.
    const rows = await this.messageRepo.find({
      where: {
        conversation: { id: conversation.id },
        ...(before ? { id: LessThan(before) } : {}),
      },
      order: { id: 'DESC' },
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    // Devolvemos en orden ASC (viejo -> nuevo) dentro de la pagina.
    page.reverse();

    const nextCursor = hasMore && page.length > 0 ? page[0].id : null;
    this.logger.log(
      `chat:page user=${userId} before=${before ?? 'none'} limit=${limit} returned=${page.length} hasMore=${hasMore} nextCursor=${nextCursor ?? 'null'}`,
    );

    return { messages: page, hasMore, nextCursor };
  }

  async deleteConversation(
    userId: number,
    channel: ChatChannel,
  ): Promise<void> {
    const conversation = await this.conversationRepo.findOne({
      where: { user: { id: userId }, channel },
    });
    if (!conversation) return;
    await this.conversationRepo.remove(conversation);
  }

  async sendMessage(
    userId: number,
    channel: ChatChannel,
    content: string | undefined,
    image?: InboundImage,
  ): Promise<ChatExchange> {
    const trimmed = (content ?? '').trim();
    if (!trimmed && !image) {
      throw new BadRequestException({
        message: 'El mensaje debe tener texto o una imagen.',
      });
    }

    let imageUrl: string | null = null;
    let imageBase64: { data: string; mediaType: string } | null = null;
    if (image) {
      imageUrl = this.storage.buildKey('chat', image.originalName);
      await this.storage.upload(imageUrl, image.buffer, image.mimeType);
      imageBase64 = {
        data: image.buffer.toString('base64'),
        mediaType: image.mimeType,
      };
    }

    const conversation = await this.getOrCreateConversation(userId, channel);

    await this.autoCancelPendingProposals(conversation.id);

    const userMessage = await this.messageRepo.save(
      this.messageRepo.create({
        conversation: { id: conversation.id },
        role: 'user',
        content: trimmed,
        imageUrl,
        kind: 'text',
        payload: null,
        status: null,
      }),
    );

    const systemPrompt = await this.buildSystemPrompt(userId);
    const history = await this.loadHistoryForLLM(conversation.id);
    const newUserContent = this.buildUserContent(trimmed, imageBase64);
    const localMessages: LLMChatMessage[] = [
      ...history,
      { role: 'user', content: newUserContent },
    ];

    const photos = imageUrl ? [imageUrl] : [];
    const forceProposeTool = isTransactionIntent(trimmed) || Boolean(image);
    let assistantText = '';
    let proposalPayload: ChatProposalPayload | null = null;

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await this.llm.generate({
        systemPrompt,
        messages: localMessages,
        tools: CHAT_TOOLS,
        maxTokens: 1024,
        toolChoice:
          forceProposeTool && i === 0
            ? { type: 'tool', name: 'propose_transaction' }
            : undefined,
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

      if (response.toolUse.name === 'propose_transaction' && toolResult.ok) {
        proposalPayload = toolResult.proposal ?? null;
        assistantText = response.text?.trim() ?? '';
        break;
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

    if (proposalPayload) {
      const assistantMessage = await this.messageRepo.save(
        this.messageRepo.create({
          conversation: { id: conversation.id },
          role: 'assistant',
          content: assistantText,
          imageUrl: null,
          kind: 'proposal',
          payload: proposalPayload as unknown as Record<string, unknown>,
          status: 'pending',
        }),
      );

      await this.conversationRepo.update(conversation.id, {
        updatedAt: new Date(),
      });

      return {
        userMessage,
        assistantMessage,
        actionsTaken: [],
      };
    }

    if (!assistantText) {
      assistantText = 'No pude completar la accion, intenta de nuevo.';
    }

    const assistantMessage = await this.messageRepo.save(
      this.messageRepo.create({
        conversation: { id: conversation.id },
        role: 'assistant',
        content: assistantText,
        imageUrl: null,
        kind: 'text',
        payload: null,
        status: null,
      }),
    );

    await this.conversationRepo.update(conversation.id, {
      updatedAt: new Date(),
    });

    return {
      userMessage,
      assistantMessage,
      actionsTaken: [],
    };
  }

  async confirmProposal(
    userId: number,
    messageId: number,
  ): Promise<ProposalResolution> {
    const message = await this.getPendingProposal(userId, messageId);
    const payload = message.payload as unknown as ChatProposalPayload;

    const result = await this.transactionsService.create(userId, {
      amount: payload.amount,
      type: payload.type,
      description: payload.description ?? '',
      accountId: payload.accountId,
      categoryId: payload.categoryId,
      date: payload.date,
      photos: payload.photos ?? [],
    });

    const transactionId = result.data?.id;
    if (!transactionId) {
      throw new BadRequestException({
        message: 'No se pudo crear el movimiento.',
      });
    }

    message.status = 'confirmed';
    message.payload = {
      ...payload,
      transactionId,
    } as unknown as Record<string, unknown>;
    const updatedProposal = await this.messageRepo.save(message);

    const followUp = await this.messageRepo.save(
      this.messageRepo.create({
        conversation: { id: message.conversationId },
        role: 'assistant',
        content: 'Listo, ya quedo registrado ✅ ¿Algo mas?',
        imageUrl: null,
        kind: 'text',
        payload: null,
        status: null,
      }),
    );

    await this.conversationRepo.update(message.conversationId, {
      updatedAt: new Date(),
    });

    return {
      proposal: updatedProposal,
      followUp,
      actionsTaken: [{ type: 'create_transaction', transactionId }],
    };
  }

  async cancelProposal(
    userId: number,
    messageId: number,
  ): Promise<ProposalResolution> {
    const message = await this.getPendingProposal(userId, messageId);

    message.status = 'cancelled';
    const updatedProposal = await this.messageRepo.save(message);

    const followUp = await this.messageRepo.save(
      this.messageRepo.create({
        conversation: { id: message.conversationId },
        role: 'assistant',
        content: 'Listo, lo descarte. Si necesitas algo mas, aqui estoy.',
        imageUrl: null,
        kind: 'text',
        payload: null,
        status: null,
      }),
    );

    await this.conversationRepo.update(message.conversationId, {
      updatedAt: new Date(),
    });

    return {
      proposal: updatedProposal,
      followUp,
      actionsTaken: [],
    };
  }

  private async getPendingProposal(userId: number, messageId: number) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId, conversation: { user: { id: userId } } },
      relations: ['conversation'],
    });
    if (!message) {
      throw new NotFoundException({ message: 'Mensaje no encontrado.' });
    }
    if (message.kind !== 'proposal' || message.status !== 'pending') {
      throw new BadRequestException({
        message: 'La propuesta ya fue procesada.',
      });
    }
    return message;
  }

  private async autoCancelPendingProposals(
    conversationId: number,
  ): Promise<void> {
    await this.messageRepo.update(
      {
        conversation: { id: conversationId },
        kind: 'proposal',
        status: In(['pending']),
      },
      { status: 'cancelled' },
    );
  }

  private buildUserContent(
    text: string,
    imageBase64: { data: string; mediaType: string } | null,
  ): string | LLMContentBlock[] {
    if (!imageBase64) return text;
    const blocks: LLMContentBlock[] = [];
    if (text) blocks.push({ type: 'text', text } as LLMTextBlock);
    blocks.push({
      type: 'image',
      source: {
        type: 'base64',
        mediaType: imageBase64.mediaType,
        data: imageBase64.data,
      },
    });
    return blocks;
  }

  private async loadHistoryForLLM(
    conversationId: number,
  ): Promise<LLMChatMessage[]> {
    const recent = await this.messageRepo.find({
      where: { conversation: { id: conversationId } },
      order: { id: 'DESC' },
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
      'Eres Otto, el asistente financiero personal de INOUT.',
      'Tu rol es ayudar al usuario a registrar y consultar sus movimientos financieros (gastos e ingresos).',
      '',
      'REGLAS ESTRICTAS:',
      '1. SOLO hablas de las finanzas del usuario logueado (gastos, ingresos, balance, cuentas y categorias). Si te preguntan algo ajeno (clima, recetas, deportes, etc.), NO lo respondas: declina con calidez en una sola frase y reconduce a sus finanzas. Ej: "Uy, de eso no se nada 😅 pero estoy aqui para ayudarte con tus finanzas." Varia la frase, no la repitas siempre igual.',
      '',
      '2. REGISTRO DE MOVIMIENTOS:',
      '   Cuando el usuario describa o muestre un movimiento (ej: "gaste 12 en uber", "recibi 500 de freelance", foto de un recibo), tu UNICA accion debe ser llamar `propose_transaction` INMEDIATAMENTE con los datos extraidos.',
      '   PROHIBIDO: pedir confirmacion por texto antes de la tool. NO escribas "Voy a registrar...", "Confirmas?", "Te propongo X" ni nada similar. La tarjeta de la UI ya pide la confirmacion al usuario; tu NO.',
      '   PROHIBIDO: responder solo con texto cuando el usuario describe un movimiento. SIEMPRE llama la tool.',
      '   Si la info esta completa, llama la tool directamente sin ningun texto previo.',
      '   Si falta info CRITICA (no puedes deducir cuenta o categoria), pregunta solo eso especifico (ej: "¿En que cuenta lo registro?"). NUNCA inventes accountId o categoryId.',
      '   Para deducir categoria: matchea el contexto del gasto/ingreso con las categorias del listado (ej: "uber" -> Transporte). Si solo hay una cuenta activa, usa esa sin preguntar.',
      '',
      '3. CAMPOS de `propose_transaction`: amount (numero positivo), type (1=ingreso, 2=gasto), description (corta), accountId, categoryId, date (YYYY-MM-DD, default: hoy).',
      '',
      '4. CONSULTAS (saldo, gastos del mes, etc.): usa las tools (`query_transactions`, `get_balance`, etc.) y responde de forma ORDENADA y amigable:',
      '   - Para totales de un periodo, llama `query_transactions` con limit=50 (asi no te quedas corto) y suma los montos.',
      '   - Nombra el periodo en palabras (ej: "mayo de 2025", "este mes", "la semana pasada"), no solo "el mes pasado".',
      '   - Da el total y, cuando aplique, las 2 o 3 categorias donde mas gasto, ordenadas de mayor a menor con su monto.',
      '   - Cierra con una pregunta corta o un comentario util si viene al caso (ej: "¿Quieres el detalle de alguna?").',
      '   - Si no hay movimientos en ese periodo, dilo de forma amable (ej: "No registraste gastos en ese periodo 👀").',
      '',
      '5. ESTILO: espanol neutro y CALIDO, como un amigo que sabe de dinero. Nunca robotico ni cortante. Frases cortas pero completas. Puedes usar 1 emoji (maximo 2) cuando sume, sin abusar. No repitas datos que ya muestra la tarjeta de una propuesta.',
      '',
      'EJEMPLOS DE COMPORTAMIENTO ESPERADO:',
      '',
      'User: "gaste 20 en uber"',
      'Otto: [llamaspropose_transaction directo con type=2, amount=20, description="Uber", categoryId=<id de Transporte>, accountId=<id de cuenta activa>, date=hoy]. Sin texto previo.',
      '',
      'User: "recibi 500 de un freelance"',
      'Otto: [llamaspropose_transaction directo con type=1, amount=500, description="Freelance", ...]. Sin texto previo.',
      '',
      'User: [foto de un voucher de S/45 de farmacia]',
      'Otto: [llamaspropose_transaction directo con los datos extraidos de la foto]. Sin texto previo.',
      '',
      'User: "cuanto gaste el mes pasado"',
      'Otto: [llamasquery_transactions con el rango del mes pasado y limit=50] y respondes algo como: "En mayo gastaste S/300 en total 💸. Donde mas se te fue: Comida S/120, Transporte S/90 y Ocio S/50. ¿Quieres ver el detalle de alguna?"',
      '',
      'User: "cuanto gaste este mes"',
      'Otto: [llamasquery_transactions con el rango de este mes y limit=50] y respondes con el periodo en palabras, el total y tus 2-3 categorias top, en tono cercano.',
      '',
      'User: "cuanto tengo"',
      'Otto: [llamasget_balance] y respondes "Tienes S/X en total 👍". Si hay varias cuentas, puedes desglosar en una linea breve.',
      '',
      'User: "como esta el clima"',
      'Otto: "Jaja de eso no se nada 🙂, pero si quieres revisamos como vienen tus gastos."',
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
    channel: ChatChannel,
  ): Promise<ChatConversation> {
    let conversation = await this.conversationRepo.findOne({
      where: { user: { id: userId }, channel },
    });
    if (!conversation) {
      conversation = await this.conversationRepo.save(
        this.conversationRepo.create({ user: { id: userId }, channel }),
      );
    }
    return conversation;
  }
}
