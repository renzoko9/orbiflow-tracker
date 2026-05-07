import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMProvider, LLMRequest, LLMResponse } from './llm.provider';

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
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: input.maxTokens ?? 1024,
      messages: [
        { role: 'system', content: input.systemPrompt },
        { role: 'user', content: input.userPrompt },
      ],
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
      | { name: string; input: Record<string, unknown> }
      | undefined;

    const firstToolCall = message.tool_calls?.[0];
    if (firstToolCall && firstToolCall.type === 'function') {
      try {
        toolUse = {
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
}
