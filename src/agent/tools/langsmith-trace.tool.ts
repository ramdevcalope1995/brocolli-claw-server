import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseTool } from './base-tool.interface';
import { Client as LangSmithClient, RunTree, RunTreeConfig } from 'langsmith';

@Injectable()
export class LangSmithTraceTool extends BaseTool {
  private readonly logger = new Logger(LangSmithTraceTool.name);
  name = 'langsmith_trace';
  description = 'Track and trace agent execution with LangSmith for debugging and monitoring';
  parameters = {
    run_name: { type: 'string', description: 'Name of the run to trace' },
    run_type: { type: 'string', enum: ['chain', 'llm', 'tool', 'retriever', 'prompt', 'parser'], default: 'chain' },
    inputs: { type: 'object', description: 'Input data for the run' },
    outputs: { type: 'object', description: 'Output data from the run', optional: true },
    metadata: { type: 'object', description: 'Additional metadata', optional: true },
    tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization', optional: true },
  };

  private client: LangSmithClient | null = null;

  constructor(private configService: ConfigService) {
    super();
    const apiKey = this.configService.get('langsmith.apiKey');
    const tracingEnabled = this.configService.get('langsmith.tracingEnabled');
    
    if (apiKey && tracingEnabled) {
      this.client = new LangSmithClient({ apiKey });
      this.logger.log('LangSmith tracing enabled');
    } else {
      this.logger.warn('LangSmith tracing disabled - missing API key or configuration');
    }
  }

  async execute(args: {
    run_name: string;
    run_type?: string;
    inputs: Record<string, any>;
    outputs?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: string[];
  }): Promise<any> {
    if (!this.client) {
      return { success: false, message: 'LangSmith tracing is not configured' };
    }

    try {
      const config: RunTreeConfig = {
        name: args.run_name,
        run_type: args.run_type as any || 'chain',
        inputs: args.inputs,
        outputs: args.outputs || {},
        metadata: {
          ...args.metadata,
          model: this.configService.get('openai.model'),
          timestamp: new Date().toISOString(),
        },
        tags: args.tags || [],
      };

      const runTree = new RunTree(config);
      await runTree.postRun();

      // If you want to end the run immediately (for simple traces)
      if (args.outputs) {
        await runTree.end(args.outputs);
        await runTree.patchRun();
      }

      return {
        success: true,
        runId: runTree.id,
        message: `Traced run: ${args.run_name}`,
      };
    } catch (error) {
      this.logger.error(`Error tracing with LangSmith: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to trace with LangSmith',
      };
    }
  }

  /**
   * Create a child run for nested tracing
   */
  async createChildRun(parentRunId: string, args: {
    run_name: string;
    run_type?: string;
    inputs?: Record<string, any>;
  }): Promise<RunTree | null> {
    if (!this.client || !parentRunId) {
      return null;
    }

    try {
      const parentRunTree = new RunTree({
        id: parentRunId,
        name: args.run_name,
        run_type: args.run_type as any || 'tool',
        inputs: args.inputs || {},
      });

      const childRun = parentRunTree.createChild({
        name: args.run_name,
        run_type: args.run_type as any || 'tool',
        inputs: args.inputs || {},
      });

      await childRun.postRun();
      return childRun;
    } catch (error) {
      this.logger.error(`Error creating child run: ${error.message}`);
      return null;
    }
  }

  /**
   * End a traced run with outputs
   */
  async endRun(runTree: RunTree, outputs: Record<string, any>): Promise<void> {
    if (!runTree) {
      return;
    }

    try {
      runTree.end(outputs);
      await runTree.patchRun();
    } catch (error) {
      this.logger.error(`Error ending run: ${error.message}`);
    }
  }

  /**
   * Log an error to a traced run
   */
  async logError(runTree: RunTree, error: Error): Promise<void> {
    if (!runTree) {
      return;
    }

    try {
      runTree.end({ error: error.message });
      runTree.addError(error);
      await runTree.patchRun();
    } catch (patchError) {
      this.logger.error(`Error logging error to run: ${patchError.message}`);
    }
  }
}
