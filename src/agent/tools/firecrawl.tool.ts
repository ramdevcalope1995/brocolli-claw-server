import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BaseTool, ToolExecutionResult } from './base-tool.interface';

@Injectable()
export class FirecrawlTool extends BaseTool {
  readonly name = 'firecrawl_scrape';
  readonly description = 'Scrape web pages and extract content using Firecrawl';
  readonly parameters = {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to scrape',
      },
      formats: {
        type: 'array',
        items: { type: 'string' },
        description: 'Content formats to extract (markdown, html, links, etc)',
      },
    },
    required: ['url'],
  };

  constructor(private readonly apiKey: string) {}

  async execute(params: Record<string, unknown>): Promise<ToolExecutionResult> {
    try {
      const { url, formats = ['markdown'] } = params as { url: string; formats?: string[] };
      
      const response = await axios.post(
        'https://api.firecrawl.dev/v1/scrape',
        {
          url,
          formats,
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
        error: error instanceof Error ? error.message : 'Firecrawl scrape failed',
      };
    }
  }
}
