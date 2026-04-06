import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from '../config/configuration';
import Database from 'better-sqlite3';

export interface AgentMetadata {
  id: string;
  name: string;
  system_prompt: string;
  tools: string;
  created_at: string;
  updated_at: string;
}

export interface SessionMetadata {
  id: string;
  user_id: string;
  agent_id: string;
  messages: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SqliteService implements OnModuleInit {
  private db: Database.Database;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {}

  async onModuleInit(): Promise<void> {
    const dbPath = this.config.database.path;
    this.db = new Database(dbPath);
    this.initializeTables();
    console.log(`SQLite database initialized at ${dbPath}`);
  }

  private initializeTables(): void {
    // Agents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        tools TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        messages TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
    `);
  }

  // Agent CRUD operations
  createAgent(agent: Omit<AgentMetadata, 'created_at' | 'updated_at'>): AgentMetadata {
    const stmt = this.db.prepare(`
      INSERT INTO agents (id, name, system_prompt, tools)
      VALUES (?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    stmt.run(agent.id, agent.name, agent.system_prompt, agent.tools);
    
    return { ...agent, created_at: now, updated_at: now };
  }

  getAgent(id: string): AgentMetadata | undefined {
    const stmt = this.db.prepare('SELECT * FROM agents WHERE id = ?');
    return stmt.get(id) as AgentMetadata | undefined;
  }

  getAllAgents(): AgentMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM agents');
    return stmt.all() as AgentMetadata[];
  }

  updateAgent(id: string, updates: Partial<AgentMetadata>): void {
    const fields: string[] = [];
    const values: unknown[] = [];
    
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.system_prompt) {
      fields.push('system_prompt = ?');
      values.push(updates.system_prompt);
    }
    if (updates.tools) {
      fields.push('tools = ?');
      values.push(updates.tools);
    }
    
    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);
      
      const stmt = this.db.prepare(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  }

  deleteAgent(id: string): void {
    const stmt = this.db.prepare('DELETE FROM agents WHERE id = ?');
    stmt.run(id);
  }

  // Session CRUD operations
  createSession(session: Omit<SessionMetadata, 'created_at' | 'updated_at'>): SessionMetadata {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, user_id, agent_id, messages)
      VALUES (?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    stmt.run(session.id, session.user_id, session.agent_id, session.messages);
    
    return { ...session, created_at: now, updated_at: now };
  }

  getSession(id: string): SessionMetadata | undefined {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id) as SessionMetadata | undefined;
  }

  updateSessionMessages(id: string, messages: string): void {
    const stmt = this.db.prepare(`
      UPDATE sessions 
      SET messages = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(messages, id);
  }

  getSessionsByUser(userId: string): SessionMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC');
    return stmt.all(userId) as SessionMetadata[];
  }
}
