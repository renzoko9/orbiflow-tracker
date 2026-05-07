export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface LLMTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  tools?: LLMTool[];
  toolChoice?: { type: 'tool'; name: string };
  maxTokens?: number;
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface LLMResponse {
  text?: string;
  toolUse?: { name: string; input: Record<string, unknown> };
  usage: LLMUsage;
}

export interface LLMProvider {
  generate(input: LLMRequest): Promise<LLMResponse>;
}
