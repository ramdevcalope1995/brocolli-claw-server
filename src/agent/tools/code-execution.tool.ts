import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BaseTool, ToolExecutionResult } from './base-tool.interface';

@Injectable()
export class CodeExecutionTool extends BaseTool {
  readonly name = 'execute_code';
  readonly description = 'Execute code securely in an E2B sandbox environment';
  readonly parameters = {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'The code to execute',
      },
      language: {
        type: 'string',
        description: 'Programming language (python, javascript, etc)',
        enum: ['python', 'javascript', 'typescript'],
      },
    },
    required: ['code', 'language'],
  };

  constructor(private readonly apiKey: string) {}

  async execute(params: Record<string, unknown>): Promise<ToolExecutionResult> {
    try {
      const { code, language } = params as { code: string; language: string };

      // Create a new sandbox and execute code
      const response = await axios.post(
        'https://e2b.dev/api/v1/sandbox/execute',
        {
          template: language === 'python' ? 'base' : 'nodejs',
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Code execution failed',
      };
    }
  }
}
