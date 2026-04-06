import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BaseTool, ToolExecutionResult } from './base-tool.interface';

@Injectable()
export class TavilySearchTool extends BaseTool {
  readonly name = 'tavily_search';
  readonly description = 'Search the web for current information using Tavily API';
  readonly parameters = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query',
      },
      maxResults: {
        type: 'integer',
        description: 'Maximum number of results to return (default: 5)',
      },
    },
    required: ['query'],
  };

  constructor(private readonly apiKey: string) {}

  async execute(params: Record<string, unknown>): Promise<ToolExecutionResult> {
    try {
      const { query, maxResults = 5 } = params as { query: string; maxResults?: number };
      
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.apiKey,
          query,
          max_results: maxResults,
          include_answer: true,
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tavily search failed',
      };
    }
  }
}
