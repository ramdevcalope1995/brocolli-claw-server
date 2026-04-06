export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  instructions?: string;
  tools: string[];
  model?: string;
  graphId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  userInput: string;
  agentOutput: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  telegramId: string;
  name?: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  defaultAgentId?: string;
  language?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface AgentExecutionResult {
  success: boolean;
  output?: string;
  messages?: any[];
  error?: string;
  traceId?: string;
  executionTime?: number;
}

export interface MemoryRecord {
  id: string;
  agentId: string;
  type: 'short-term' | 'long-term';
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
}

export interface WorkflowStep {
  id: string;
  type: 'agent' | 'tool' | 'condition' | 'delay';
  config: Record<string, any>;
  next?: string;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'webhook';
  config: Record<string, any>;
}
