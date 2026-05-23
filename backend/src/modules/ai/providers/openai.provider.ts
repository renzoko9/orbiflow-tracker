import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  LLMChatMessage,
  LLMContentBlock,
  LLMImageBlock,
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from './llm.provider';

type OpenAIMessage =
  OpenAI.Chat.Completions.ChatCompletionMessageParam;

@Injectable()
export class OpenAIProvider implements LLMProvider, OnModuleInit {
  private readonly logger = new Logger(OpenAIProvider.name);
  private client: OpenAI;
  private model = 'gpt-4o-mini';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY no esta configurado. Las llamadas a la IA fallaran.',
      );
    }
    this.client = new OpenAI({ apiKey: apiKey ?? '' });
  }

  async generate(input: LLMRequest): Promise<LLMResponse> {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: input.systemPrompt },
      ...input.messages.flatMap((m) => this.mapMessage(m)),
    ];

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: input.maxTokens ?? 1024,
      messages,
      tools: input.tools?.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.inputSchema,
        },
      })),
      tool_choice: input.toolChoice
        ? { type: 'function', function: { name: input.toolChoice.name } }
        : undefined,
    });

    const message = response.choices[0]?.message;
    if (!message) {
      throw new Error('OpenAI no devolvio choices[0].message');
    }

    let toolUse:
      | { id: string; name: string; input: Record<string, unknown> }
      | undefined;

    const firstToolCall = message.tool_calls?.[0];
    if (firstToolCall && firstToolCall.type === 'function') {
      try {
        toolUse = {
          id: firstToolCall.id,
          name: firstToolCall.function.name,
          input: JSON.parse(firstToolCall.function.arguments) as Record<
            string,
            unknown
          >,
        };
      } catch {
        throw new Error(
          `OpenAI devolvio tool_call con arguments invalidos: ${firstToolCall.function.arguments.slice(0, 200)}`,
        );
      }
    }

    return {
      text: message.content ?? undefined,
      toolUse,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }

  private mapMessage(msg: LLMChatMessage): OpenAIMessage[] {
    if (typeof msg.content === 'string') {
      return [{ role: msg.role, content: msg.content }];
    }

    if (msg.role === 'user') {
      return this.mapUserBlocks(msg.content);
    }

    return this.mapAssistantBlocks(msg.content);
  }

  private mapUserBlocks(blocks: LLMContentBlock[]): OpenAIMessage[] {
    const toolResultMessages: OpenAIMessage[] = [];
    const userParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

    for (const block of blocks) {
      if (block.type === 'text') {
        userParts.push({ type: 'text', text: block.text });
      } else if (block.type === 'image') {
        userParts.push({
          type: 'image_url',
          image_url: { url: this.toImageUrl(block) },
        });
      } else if (block.type === 'tool_result') {
        toolResultMessages.push({
          role: 'tool',
          tool_call_id: block.toolUseId,
          content: block.content,
        });
      }
    }

    const result: OpenAIMessage[] = [...toolResultMessages];
    if (userParts.length > 0) {
      result.push({ role: 'user', content: userParts });
    }
    return result;
  }

  private mapAssistantBlocks(blocks: LLMContentBlock[]): OpenAIMessage[] {
    const textParts: string[] = [];
    const toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] =
      [];

    for (const block of blocks) {
      if (block.type === 'text') {
        textParts.push(block.text);
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          type: 'function',
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input),
          },
        });
      }
    }

    const assistantMsg: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam =
      {
        role: 'assistant',
        content: textParts.length > 0 ? textParts.join('\n') : null,
      };
    if (toolCalls.length > 0) {
      assistantMsg.tool_calls = toolCalls;
    }
    return [assistantMsg];
  }

  private toImageUrl(block: LLMImageBlock): string {
    if (block.source.type === 'url') return block.source.url;
    return `data:${block.source.mediaType};base64,${block.source.data}`;
  }
}
