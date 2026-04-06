# Agentic AI Backend - NestJS

Production-ready NestJS backend for an agentic AI system with multi-agent orchestration, tool calling, memory management, and workflow execution.

## Architecture

- **NestJS**: Main API orchestrator
- **LangGraph**: Agent runtime with Qwen 3.6 model
- **E2B**: Secure code execution sandbox
- **Upstash Redis**: Caching and session memory
- **Upstash Vector DB**: Embeddings and long-term memory
- **SQLite**: Metadata storage
- **Inngest**: Async workflows
- **Telegram Bot**: Primary user interface
- **LangSmith**: Tracing and monitoring

## Features

- ✅ Multi-agent orchestration
- ✅ Tool calling (Tavily, Firecrawl, Skyvern, Code Execution)
- ✅ Short-term + Vector memory
- ✅ Browser automation (Skyvern)
- ✅ Voice call automation ready (VAPI)
- ✅ Workflow execution via Inngest
- ✅ LangSmith tracing integration
- ✅ Telegram bot UI

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Upstash Redis Configuration
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your_redis_token

# Upstash Vector DB Configuration
UPSTASH_VECTOR_URL=https://your-vector.upstash.io
UPSTASH_VECTOR_TOKEN=your_vector_token

# OpenAI/Qwen Model Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL=qwen-3.6

# E2B Code Execution Configuration
E2B_API_KEY=your_e2b_api_key

# Inngest Workflow Configuration
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Tavily Search Configuration
TAVILY_API_KEY=your_tavily_api_key

# Firecrawl Web Scraping Configuration
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Skyvern Browser Automation Configuration
SKYVERN_API_KEY=your_skyvern_api_key
SKYVERN_BASE_URL=https://api.skyvern.com

# VAPI Voice Agent Configuration
VAPI_API_KEY=your_vapi_api_key

# MCP Context7 Configuration
MCP_CONTEXT7_API_KEY=your_mcp_context7_api_key

# LangSmith Trace Configuration
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=agentic-ai-system
LANGSMITH_TRACING_ENABLED=true

# SQLite Database Path
SQLITE_DB_PATH=./data/metadata.db
```

## Installation

```bash
npm install
```

## Development

```bash
npm run start:dev
```

## Production

```bash
npm run build
npm run start:prod
```

## Project Structure

```
src/
├── app.module.ts                 # Root module
├── app.controller.ts             # Root controller
├── app.service.ts                # Root service
├── main.ts                       # Entry point
├── config/
│   └── configuration.ts          # Environment configuration
├── agent/
│   ├── agent.module.ts           # Agent module
│   ├── runtime/
│   │   ├── agent-runtime.service.ts    # Agent runtime logic
│   │   ├── langgraph-executor.ts       # LangGraph integration
│   │   └── index.ts
│   └── tools/
│       ├── base-tool.interface.ts      # Tool interface
│       ├── tavily-search.tool.ts       # Web search
│       ├── firecrawl.tool.ts           # Web scraping
│       ├── skyvern.tool.ts             # Browser automation
│       ├── code-execution.tool.ts      # Code execution (E2B)
│       ├── langsmith-trace.tool.ts     # LangSmith tracing
│       └── index.ts
├── cache/
│   └── redis-cache.service.ts    # Redis caching
├── database/
│   └── sqlite.service.ts         # SQLite metadata storage
├── vector/
│   └── upstash-vector.service.ts # Vector database
├── inngest/
│   └── inngest.service.ts        # Workflow engine
├── telegram/
│   └── telegram.service.ts       # Telegram bot
├── frontend/
│   └── agent-config.controller.ts # Agent configuration API
└── types/
    └── agent.types.ts            # Type definitions
```

## Available Tools

1. **Tavily Search** - Web search for current information
2. **Firecrawl** - Web scraping and crawling
3. **Skyvern** - Browser automation tasks
4. **Code Execution** - Secure code execution via E2B
5. **LangSmith Trace** - Execution tracing and monitoring

## API Endpoints

### Agent Configuration

- `GET /agents` - List all agents
- `GET /agents/:id` - Get agent by ID
- `POST /agents` - Create new agent
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent

### Example Agent Configuration

```json
{
  "id": "sales-agent",
  "name": "Sales Assistant",
  "description": "AI assistant for sales calls and lead qualification",
  "systemPrompt": "You are a helpful sales assistant...",
  "tools": ["tavily_search", "firecrawl"],
  "model": "qwen-3.6"
}
```

## Telegram Bot Commands

- `/start` - Start the bot
- `/help` - Show help message
- `/agents` - List available agents and tools
- `/new` - Start new conversation
- `/clear` - Clear conversation history

## LangSmith Integration

When `LANGSMITH_TRACING_ENABLED=true`, all agent executions and tool calls are automatically traced in LangSmith for:

- Debugging
- Performance monitoring
- Cost tracking
- Error analysis

View traces at: https://smith.langchain.com

## License

UNLICENSED
