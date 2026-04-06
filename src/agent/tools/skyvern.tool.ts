import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BaseTool, ToolExecutionResult } from './base-tool.interface';

@Injectable()
export class SkyvernTool extends BaseTool {
  readonly name = 'skyvern_browser_automation';
  readonly description = 'Automate browser tasks using Skyvern (clicks, forms, navigation)';
  readonly parameters = {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to navigate to',
      },
      task: {
        type: 'string',
        description: 'The task to perform (e.g., "fill form", "click button")',
      },
      navigationGoal: {
        type: 'string',
        description: 'What the automation should achieve',
      },
    },
    required: ['url', 'task'],
  };

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  async execute(params: Record<string, unknown>): Promise<ToolExecutionResult> {
    try {
      const { url, task, navigationGoal } = params as {
        url: string;
        task: string;
        navigationGoal?: string;
      };

      const response = await axios.post(
        `${this.baseUrl}/api/v1/tasks`,
        {
          url,
          navigation_goal: navigationGoal || task,
          data_extraction_goal: task,
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
        error: error instanceof Error ? error.message : 'Skyvern automation failed',
      };
    }
  }
}
