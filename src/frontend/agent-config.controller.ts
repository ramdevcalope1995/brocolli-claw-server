import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SqliteService, AgentMetadata } from '../database/sqlite.service';

@Controller('api/agents')
export class AgentConfigController {
  constructor(private readonly sqliteService: SqliteService) {}

  @Get()
  getAllAgents(): AgentMetadata[] {
    return this.sqliteService.getAllAgents();
  }

  @Get(':id')
  getAgent(@Param('id') id: string): AgentMetadata | undefined {
    return this.sqliteService.getAgent(id);
  }

  @Post()
  createAgent(
    @Body() body: { id: string; name: string; systemPrompt: string; tools: string[] },
  ): AgentMetadata {
    return this.sqliteService.createAgent({
      id: body.id,
      name: body.name,
      system_prompt: body.systemPrompt,
      tools: JSON.stringify(body.tools),
    });
  }

  @Put(':id')
  updateAgent(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; systemPrompt: string; tools: string[] }>,
  ): void {
    const updates: Partial<AgentMetadata> = {};
    if (body.name) updates.name = body.name;
    if (body.systemPrompt) updates.system_prompt = body.systemPrompt;
    if (body.tools) updates.tools = JSON.stringify(body.tools);
    this.sqliteService.updateAgent(id, updates);
  }

  @Delete(':id')
  deleteAgent(@Param('id') id: string): void {
    this.sqliteService.deleteAgent(id);
  }
}
