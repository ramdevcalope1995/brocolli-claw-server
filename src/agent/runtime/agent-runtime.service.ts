import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from '../../config/configuration';
import { BaseTool, ToolExecutionResult } from '../tools/base-tool.interface';
import { LangGraphExecutor, GraphState, Message } from './langgraph-executor';
import { LangSmithTraceTool } from '../tools/langsmith-trace.tool';
import { RunTree } from 'langsmith';

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  tools: string[];
  model?: string;
}

@Injectable()
export class AgentRuntimeService {
  private readonly logger = new Logger(AgentRuntimeService.name);
  private agents: Map<string, AgentConfig> = new Map();
  private toolRegistry: Map<string, BaseTool> = new Map();
  private langSmithTool: LangSmithTraceTool | null = null;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
    private readonly langGraphExecutor: LangGraphExecutor,
  ) {
    // Initialize LangSmith tracing if enabled
    if (this.config.langsmith.tracingEnabled && this.config.langsmith.apiKey) {
      this.logger.log('LangSmith tracing enabled for agent runtime');
    }
  }

  setLangSmithTool(tool: LangSmithTraceTool): void {
    this.langSmithTool = tool;
  }

  registerTool(tool: BaseTool): void {
    this.toolRegistry.set(tool.name, tool);
  }

  registerAgent(config: AgentConfig): void {
    this.agents.set(config.id, config);
  }

  getAgent(agentId: string): AgentConfig | undefined {
    return this.agents.get(agentId);
  }

  async executeAgent(
    agentId: string,
    sessionId: string,
    userMessage: string,
    conversationHistory: Message[] = [],
  ): Promise<Message[]> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Start LangSmith trace if enabled
    let rootRun: RunTree | null = null;
    if (this.langSmithTool && this.config.langsmith.tracingEnabled) {
      try {
        const traceResult = await this.langSmithTool.execute({
          run_name: `agent_${agent.name}`,
          run_type: 'chain',
          inputs: {
            agentId,
            sessionId,
            userMessage,
            conversationHistoryLength: conversationHistory.length,
          },
          metadata: {
            agentName: agent.name,
            model: agent.model || this.config.openai.model,
            tools: agent.tools,
          },
          tags: ['agent-execution', agentId],
        });

        if (traceResult.success && traceResult.runId) {
          this.logger.debug(`Started LangSmith trace: ${traceResult.runId}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to start LangSmith trace: ${error.message}`);
      }
    }

    try {
      const systemMessage: Message = {
        role: 'system',
        content: agent.systemPrompt,
      };

      const state: GraphState = {
        messages: [systemMessage, ...conversationHistory, { role: 'user', content: userMessage }],
        sessionId,
        agentId,
      };

      const result = await this.langGraphExecutor.execute(state);

      // End LangSmith trace if started
      if (this.langSmithTool && rootRun) {
        await this.langSmithTool.endRun(rootRun, {
          messages: result.messages,
          messageCount: result.messages.length,
        });
      }

      return result.messages;
    } catch (error) {
      // Log error to LangSmith if enabled
      if (this.langSmithTool && rootRun) {
        await this.langSmithTool.logError(rootRun, error);
      }
      throw error;
    }
  }

  async executeTool(toolName: string, params: Record<string, unknown>): Promise<ToolExecutionResult> {
    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool ${toolName} not found`,
      };
    }

    // Trace tool execution with LangSmith if enabled
    if (this.langSmithTool && this.config.langsmith.tracingEnabled) {
      try {
        await this.langSmithTool.execute({
          run_name: `tool_${toolName}`,
          run_type: 'tool',
          inputs: params,
          tags: ['tool-execution', toolName],
        });
      } catch (traceError) {
        this.logger.warn(`Failed to trace tool execution: ${traceError.message}`);
      }
    }

    return tool.execute(params);
  }

  getAvailableTools(): string[] {
    return Array.from(this.toolRegistry.keys());
  }
}
