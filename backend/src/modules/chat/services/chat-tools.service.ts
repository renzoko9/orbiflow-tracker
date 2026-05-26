import { Injectable, Logger } from '@nestjs/common';
import { Between, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  AccountRepository,
  CategoryRepository,
  TransactionRepository,
} from '@Repositories';
import { TransactionTypeEnum } from '@Enums';
import { LLMTool } from '../../ai/providers/llm.provider';
import { ChatProposalPayload } from '../models/chat-response.model';

export interface ToolExecutionResult {
  ok: boolean;
  data?: unknown;
  error?: string;
  proposal?: ChatProposalPayload;
}

export const CHAT_TOOLS: LLMTool[] = [
  {
    name: 'list_accounts',
    description:
      'Lista las cuentas activas del usuario con id, nombre y balance. Usalo cuando necesites saber a que cuenta asignar un movimiento.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'list_categories',
    description:
      'Lista las categorias disponibles para el usuario (sin filtros o filtradas por tipo). Usalo para encontrar el categoryId correcto antes de crear un movimiento.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'integer',
          enum: [1, 2],
          description: '1 = Ingreso, 2 = Gasto. Omitir para listar todas.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'query_transactions',
    description:
      'Busca movimientos del usuario con filtros opcionales. Usalo para responder preguntas como "cuanto gaste en X" o "movimientos de este mes".',
    inputSchema: {
      type: 'object',
      properties: {
        dateFrom: {
          type: 'string',
          description: 'Fecha desde en formato YYYY-MM-DD.',
        },
        dateTo: {
          type: 'string',
          description: 'Fecha hasta en formato YYYY-MM-DD.',
        },
        type: {
          type: 'integer',
          enum: [1, 2],
          description: '1 = Ingreso, 2 = Gasto.',
        },
        categoryId: { type: 'integer' },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          description: 'Cantidad maxima a devolver. Default 20.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_balance',
    description:
      'Devuelve el balance total del usuario sumando todas sus cuentas activas, y el balance por cuenta.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'propose_transaction',
    description:
      'OBLIGATORIO usar esta tool apenas el usuario describa un movimiento (gasto o ingreso), incluyendo desde foto. NO pidas confirmacion por texto antes de llamarla: la UI muestra una tarjeta con botones Confirmar/Cancelar al ejecutarse la tool. El movimiento se crea solo si el usuario presiona Confirmar.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          minimum: 0.01,
          description: 'Monto positivo del movimiento.',
        },
        type: {
          type: 'integer',
          enum: [1, 2],
          description: '1 = Ingreso, 2 = Gasto.',
        },
        description: {
          type: 'string',
          description: 'Descripcion corta del movimiento.',
        },
        accountId: {
          type: 'integer',
          description: 'ID de la cuenta. Debe ser una cuenta del usuario.',
        },
        categoryId: {
          type: 'integer',
          description: 'ID de la categoria. Debe ser una categoria valida.',
        },
        date: {
          type: 'string',
          description:
            'Fecha del movimiento en formato YYYY-MM-DD. Si el usuario no la especifica, usar la fecha de hoy.',
        },
      },
      required: ['amount', 'type', 'accountId', 'categoryId', 'date'],
      additionalProperties: false,
    },
  },
];

@Injectable()
export class ChatToolsService {
  private readonly logger = new Logger(ChatToolsService.name);

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    userId: number,
    toolName: string,
    input: Record<string, unknown>,
    photos: string[] = [],
  ): Promise<ToolExecutionResult> {
    try {
      switch (toolName) {
        case 'list_accounts':
          return await this.listAccounts(userId);
        case 'list_categories':
          return await this.listCategories(userId, input);
        case 'query_transactions':
          return await this.queryTransactions(userId, input);
        case 'get_balance':
          return await this.getBalance(userId);
        case 'propose_transaction':
          return await this.proposeTransaction(userId, input, photos);
        default:
          return { ok: false, error: `Tool desconocida: ${toolName}` };
      }
    } catch (err) {
      this.logger.error(
        `Error ejecutando tool ${toolName} para user ${userId}: ${(err as Error).message}`,
      );
      return { ok: false, error: (err as Error).message };
    }
  }

  private async listAccounts(userId: number): Promise<ToolExecutionResult> {
    const accounts = await this.accountRepository.find({
      where: { user: { id: userId }, archivedAt: IsNull() },
    });
    return {
      ok: true,
      data: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: Number(a.balance),
      })),
    };
  }

  private async listCategories(
    userId: number,
    input: Record<string, unknown>,
  ): Promise<ToolExecutionResult> {
    const type = this.parseType(input.type);
    const categories = await this.categoryRepository
      .createQueryBuilder('cat')
      .where('cat.archived_at IS NULL')
      .andWhere('(cat.user_id = :userId OR cat.user_id IS NULL)', { userId })
      .andWhere(type !== undefined ? 'cat.type = :type' : '1=1', { type })
      .orderBy('cat.name', 'ASC')
      .getMany();

    return {
      ok: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
      })),
    };
  }

  private async queryTransactions(
    userId: number,
    input: Record<string, unknown>,
  ): Promise<ToolExecutionResult> {
    const dateFrom = this.parseString(input.dateFrom);
    const dateTo = this.parseString(input.dateTo);
    const type = this.parseType(input.type);
    const categoryId = this.parseInt(input.categoryId);
    const limit = this.parseInt(input.limit) ?? 20;

    const where: Record<string, unknown> = {
      user: { id: userId },
      transferGroupId: IsNull(),
    };
    if (type !== undefined) where.type = type;
    if (categoryId !== undefined) where.category = { id: categoryId };
    if (dateFrom && dateTo) {
      where.date = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      where.date = MoreThanOrEqual(new Date(dateFrom));
    } else if (dateTo) {
      where.date = LessThanOrEqual(new Date(dateTo));
    }

    const txs = await this.transactionRepository.find({
      where,
      relations: ['category', 'account'],
      order: { date: 'DESC', createdAt: 'DESC' },
      take: Math.min(limit, 50),
    });

    return {
      ok: true,
      data: txs.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        type: tx.type,
        description: tx.description,
        date:
          tx.date instanceof Date
            ? tx.date.toISOString().split('T')[0]
            : String(tx.date),
        categoryName: tx.category?.name ?? null,
        accountName: tx.account?.name ?? null,
      })),
    };
  }

  private async getBalance(userId: number): Promise<ToolExecutionResult> {
    const accounts = await this.accountRepository.find({
      where: { user: { id: userId }, archivedAt: IsNull() },
    });
    const total = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    return {
      ok: true,
      data: {
        total,
        accounts: accounts.map((a) => ({
          id: a.id,
          name: a.name,
          balance: Number(a.balance),
        })),
      },
    };
  }

  private async proposeTransaction(
    userId: number,
    input: Record<string, unknown>,
    photos: string[],
  ): Promise<ToolExecutionResult> {
    const amount = this.parseNumber(input.amount);
    const type = this.parseType(input.type);
    const accountId = this.parseInt(input.accountId);
    const categoryId = this.parseInt(input.categoryId);
    const date = this.parseString(input.date);
    const description = this.parseString(input.description) ?? '';

    if (
      amount === undefined ||
      type === undefined ||
      accountId === undefined ||
      categoryId === undefined ||
      !date
    ) {
      return {
        ok: false,
        error:
          'Faltan campos requeridos: amount, type, accountId, categoryId, date.',
      };
    }

    const account = await this.accountRepository.findOne({
      where: { id: accountId, user: { id: userId }, archivedAt: IsNull() },
    });
    if (!account) {
      return { ok: false, error: `Cuenta ${accountId} no encontrada.` };
    }

    const category = await this.categoryRepository
      .createQueryBuilder('cat')
      .where('cat.id = :categoryId', { categoryId })
      .andWhere('cat.archived_at IS NULL')
      .andWhere('(cat.user_id = :userId OR cat.user_id IS NULL)', { userId })
      .getOne();
    if (!category) {
      return { ok: false, error: `Categoria ${categoryId} no encontrada.` };
    }

    const proposal: ChatProposalPayload = {
      amount,
      type: type as 1 | 2,
      description,
      accountId,
      accountName: account.name,
      categoryId,
      categoryName: category.name,
      date,
      photos,
    };

    return { ok: true, data: proposal, proposal };
  }

  private parseType(value: unknown): TransactionTypeEnum | undefined {
    if (value === undefined || value === null) return undefined;
    const n = Number(value);
    if (n === 1 || n === 2) return n as TransactionTypeEnum;
    return undefined;
  }

  private parseInt(value: unknown): number | undefined {
    if (value === undefined || value === null) return undefined;
    const n = Number(value);
    return Number.isInteger(n) ? n : undefined;
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === undefined || value === null) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  private parseString(value: unknown): string | undefined {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    return undefined;
  }
}
