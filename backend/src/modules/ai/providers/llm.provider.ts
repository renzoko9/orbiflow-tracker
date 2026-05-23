export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface LLMTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface LLMTextBlock {
  type: 'text';
  text: string;
}

export interface LLMImageBlock {
  type: 'image';
  source:
    | { type: 'base64'; mediaType: string; data: string }
    | { type: 'url'; url: string };
}

export interface LLMToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LLMToolResultBlock {
  type: 'tool_result';
  toolUseId: string;
  content: string;
  isError?: boolean;
}

export type LLMContentBlock =
  | LLMTextBlock
  | LLMImageBlock
  | LLMToolUseBlock
  | LLMToolResultBlock;

export interface LLMChatMessage {
  role: 'user' | 'assistant';
  content: string | LLMContentBlock[];
}

export interface LLMRequest {
  systemPrompt: string;
  messages: LLMChatMessage[];
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
  toolUse?: { id: string; name: string; input: Record<string, unknown> };
  usage: LLMUsage;
}

export interface LLMProvider {
  generate(input: LLMRequest): Promise<LLMResponse>;
}
