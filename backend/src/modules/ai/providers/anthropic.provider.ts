import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LLMChatMessage,
  LLMContentBlock,
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from './llm.provider';

@Injectable()
export class AnthropicProvider implements LLMProvider, OnModuleInit {
  private readonly logger = new Logger(AnthropicProvider.name);
  private client: Anthropic;
  private model = 'claude-haiku-4-5';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY no está configurado. Las llamadas a la IA fallarán.',
      );
    }
    this.client = new Anthropic({ apiKey: apiKey ?? '' });
  }

  async generate(input: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: input.maxTokens ?? 1024,
      system: input.systemPrompt,
      messages: input.messages.map((m) => this.mapMessage(m)),
      tools: input.tools?.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
      })),
      tool_choice: input.toolChoice,
    });

    let text: string | undefined;
    let toolUse:
      | { id: string; name: string; input: Record<string, unknown> }
      | undefined;

    for (const block of response.content) {
      if (block.type === 'text') {
        text = block.text;
      } else if (block.type === 'tool_use') {
        toolUse = {
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        };
      }
    }

    return {
      text,
      toolUse,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  private mapMessage(msg: LLMChatMessage): Anthropic.MessageParam {
    if (typeof msg.content === 'string') {
      return { role: msg.role, content: msg.content };
    }

    return {
      role: msg.role,
      content: msg.content
        .map((b) => this.mapBlock(b))
        .filter((b): b is Anthropic.ContentBlockParam => b !== null),
    };
  }

  private mapBlock(block: LLMContentBlock): Anthropic.ContentBlockParam | null {
    if (block.type === 'text') {
      return { type: 'text', text: block.text };
    }
    if (block.type === 'image') {
      if (block.source.type === 'base64') {
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: block.source
              .mediaType as Anthropic.Base64ImageSource['media_type'],
            data: block.source.data,
          },
        };
      }
      return {
        type: 'image',
        source: { type: 'url', url: block.source.url },
      };
    }
    if (block.type === 'tool_use') {
      return {
        type: 'tool_use',
        id: block.id,
        name: block.name,
        input: block.input,
      };
    }
    if (block.type === 'tool_result') {
      return {
        type: 'tool_result',
        tool_use_id: block.toolUseId,
        content: block.content,
        is_error: block.isError,
      };
    }
    return null;
  }
}
