import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from '../../config/configuration';

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

export interface GraphState {
  messages: Message[];
  sessionId: string;
  agentId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LangGraphExecutor {
  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {}

  async execute(state: GraphState): Promise<GraphState> {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // Simulate Qwen 3.6 model response via OpenAI-compatible API
    const response = await this.callModel(state.messages);
    
    state.messages.push(response);
    
    // Check for tool calls
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        const toolResult = await this.executeTool(toolCall);
        state.messages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });
      }
      
      // Call model again with tool results
      const followUpResponse = await this.callModel(state.messages);
      state.messages.push(followUpResponse);
    }
    
    return state;
  }

  private async callModel(messages: Message[]): Promise<Message> {
    // In production, this would call the actual Qwen 3.6 model
    // using the OpenAI-compatible API endpoint
    const systemPrompt = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    console.log('Calling model with:', {
      model: this.config.openai.model,
      baseUrl: this.config.openai.baseUrl,
      messageCount: userMessages.length,
    });

    // Placeholder response - in production, integrate with actual model
    return {
      role: 'assistant',
      content: `Processed ${userMessages.length} messages with model ${this.config.openai.model}`,
    };
  }

  private async executeTool(toolCall: {
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }): Promise<unknown> {
    // Tool execution would be handled by the AgentRuntimeService
    // This is a placeholder
    return { result: `Tool ${toolCall.function.name} executed` };
  }
}
