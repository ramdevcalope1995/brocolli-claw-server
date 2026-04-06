import { registerAs } from '@nestjs/config';

export default registerAs('configuration', () => ({
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  redis: {
    url: process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  },
  vector: {
    url: process.env.UPSTASH_VECTOR_URL || process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_TOKEN || process.env.UPSTASH_VECTOR_REST_TOKEN,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || process.env.QWEN_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || process.env.QWEN_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.AI_MODEL || process.env.QWEN_MODEL || 'qwen-3.6',
  },
  e2b: {
    apiKey: process.env.E2B_API_KEY,
  },
  inngest: {
    eventKey: process.env.INNGEST_EVENT_KEY,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY,
  },
  firecrawl: {
    apiKey: process.env.FIRECRAWL_API_KEY,
  },
  skyvern: {
    apiKey: process.env.SKYVERN_API_KEY,
    baseUrl: process.env.SKYVERN_BASE_URL || 'https://api.skyvern.com',
  },
  vapi: {
    apiKey: process.env.VAPI_API_KEY || process.env.VAPI_PRIVATE_KEY,
    publicKey: process.env.VAPI_PUBLIC_KEY,
  },
  mcpContext7: {
    apiKey: process.env.MCP_CONTEXT7_API_KEY || process.env.MCP_CONTEXT7_AUTH_TOKEN,
    url: process.env.MCP_CONTEXT7_URL,
    projectId: process.env.MCP_CONTEXT7_PROJECT_ID,
  },
  langsmith: {
    apiKey: process.env.LANGSMITH_API_KEY,
    project: process.env.LANGSMITH_PROJECT || 'agentic-ai-system',
    tracingEnabled: process.env.LANGSMITH_TRACING_ENABLED === 'true',
  },
  database: {
    path: process.env.SQLITE_DB_PATH || process.env.DATABASE_URL?.replace('file:', '') || './data/metadata.db',
  },
  langgraph: {
    serverUrl: process.env.LANGGRAPH_SERVER_URL || 'http://langgraph:8000',
  },
  opencode: {
    cliPath: process.env.OPENCODE_CLI_PATH || '/usr/local/bin/opencode',
  },
}));
