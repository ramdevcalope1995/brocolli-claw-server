import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AgentModule } from './agent/agent.module';
import { SqliteService } from './database/sqlite.service';
import { UpstashVectorService } from './vector/upstash-vector.service';
import { RedisCacheService } from './cache/redis-cache.service';
import { InngestService } from './inngest/inngest.service';
import { TelegramService } from './telegram/telegram.service';
import { AgentConfigController } from './frontend/agent-config.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AgentModule,
  ],
  providers: [
    SqliteService,
    UpstashVectorService,
    RedisCacheService,
    InngestService,
    TelegramService,
  ],
  controllers: [AgentConfigController],
})
export class AppModule {}
