import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from '../config/configuration';
import { Index } from '@upstash/vector';

export interface VectorDocument {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
}

@Injectable()
export class UpstashVectorService {
  private index: Index;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {
    if (this.config.vector.url && this.config.vector.token) {
      this.index = new Index({
        url: this.config.vector.url,
        token: this.config.vector.token,
      });
    }
  }

  async upsert(document: VectorDocument): Promise<void> {
    if (!this.index) {
      console.warn('Vector service not configured');
      return;
    }
    await this.index.upsert({
      id: document.id,
      vector: document.vector,
      metadata: document.metadata,
    });
  }

  async query(vector: number[], topK: number = 5): Promise<VectorDocument[]> {
    if (!this.index) {
      console.warn('Vector service not configured');
      return [];
    }
    
    const results = await this.index.query({
      vector,
      topK,
      includeMetadata: true,
    });

    return results.map((r) => ({
      id: String(r.id),
      vector: r.vector || [],
      metadata: r.metadata,
    }));
  }

  async delete(id: string): Promise<void> {
    if (!this.index) {
      return;
    }
    await this.index.delete(id);
  }

  async describe(): Promise<{ dimension: number; count: number }> {
    if (!this.index) {
      return { dimension: 0, count: 0 };
    }
    return this.index.describe();
  }
}
