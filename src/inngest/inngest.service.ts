import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from '../config/configuration';
import { Inngest } from 'inngest';

export interface WorkflowEvent {
  name: string;
  data: Record<string, unknown>;
}

@Injectable()
export class InngestService {
  public readonly inngest: Inngest;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {
    this.inngest = new Inngest({ 
      id: 'agentic-ai-backend',
      eventKey: this.config.inngest.eventKey || '',
    });
  }

  async sendEvent(event: WorkflowEvent): Promise<void> {
    try {
      await this.inngest.send({
        name: event.name,
        data: event.data,
      });
      console.log(`Event sent: ${event.name}`);
    } catch (error) {
      console.error('Failed to send Inngest event:', error);
    }
  }

  // Predefined workflow events
  async triggerAgentWorkflow(agentId: string, sessionId: string, message: string): Promise<void> {
    await this.sendEvent({
      name: 'agent.workflow.execute',
      data: {
        agentId,
        sessionId,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async triggerVoiceCall(userId: string, phoneNumber: string, script: string): Promise<void> {
    await this.sendEvent({
      name: 'voice.call.initiate',
      data: {
        userId,
        phoneNumber,
        script,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async triggerBrowserAutomation(taskId: string, url: string, action: string): Promise<void> {
    await this.sendEvent({
      name: 'browser.automation.run',
      data: {
        taskId,
        url,
        action,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
