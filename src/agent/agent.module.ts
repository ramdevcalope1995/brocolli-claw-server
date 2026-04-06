import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { AgentRuntimeService } from './runtime/agent-runtime.service';
import { LangGraphExecutor } from './runtime/langgraph-executor';
import { TavilySearchTool } from './tools/tavily-search.tool';
import { FirecrawlTool } from './tools/firecrawl.tool';
import { SkyvernTool } from './tools/skyvern.tool';
import { CodeExecutionTool } from './tools/code-execution.tool';
import { LangSmithTraceTool } from './tools/langsmith-trace.tool';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(configuration),
  ],
  providers: [
    AgentRuntimeService,
    LangGraphExecutor,
    TavilySearchTool,
    FirecrawlTool,
    SkyvernTool,
    CodeExecutionTool,
    LangSmithTraceTool,
  ],
  exports: [
    AgentRuntimeService,
    LangGraphExecutor,
    TavilySearchTool,
    FirecrawlTool,
    SkyvernTool,
    CodeExecutionTool,
    LangSmithTraceTool,
  ],
})
export class AgentModule {}
