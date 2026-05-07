import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
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
      messages: [{ role: 'user', content: input.userPrompt }],
      tools: input.tools?.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
      })),
      tool_choice: input.toolChoice,
    });

    let text: string | undefined;
    let toolUse: { name: string; input: Record<string, unknown> } | undefined;

    for (const block of response.content) {
      if (block.type === 'text') {
        text = block.text;
      } else if (block.type === 'tool_use') {
        toolUse = {
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
}
