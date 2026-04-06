import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from '../config/configuration';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisCacheService {
  private redis: Redis;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {
    if (this.config.redis.url && this.config.redis.token) {
      this.redis = new Redis({
        url: this.config.redis.url,
        token: this.config.redis.token,
      });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    return this.redis.get<T>(key);
  }

  async set(key: string, value: unknown, ex?: number): Promise<void> {
    if (!this.redis) return;
    await this.redis.set(key, value, ex ? { ex } : undefined);
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    const result = await this.redis.exists(key);
    return result > 0;
  }

  // Session memory operations
  async getSessionMemory(sessionId: string): Promise<string[]> {
    const key = `session:${sessionId}:messages`;
    const messages = await this.get<string[]>(key);
    return messages || [];
  }

  async addSessionMemory(sessionId: string, message: string): Promise<void> {
    const key = `session:${sessionId}:messages`;
    const messages = await this.getSessionMemory(sessionId);
    messages.push(message);
    // Keep last 50 messages for short-term memory
    const trimmed = messages.slice(-50);
    await this.set(key, trimmed, 3600); // 1 hour TTL
  }

  async clearSessionMemory(sessionId: string): Promise<void> {
    await this.delete(`session:${sessionId}:messages`);
  }
}
