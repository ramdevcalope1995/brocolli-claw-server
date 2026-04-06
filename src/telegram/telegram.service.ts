import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from '../config/configuration';
import { Telegraf, Context, Markup } from 'telegraf';
import { AgentRuntimeService } from '../agent/runtime/agent-runtime.service';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf<Context>;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
    private readonly agentRuntime: AgentRuntimeService,
  ) {
    if (this.config.telegram.botToken) {
      this.bot = new Telegraf(this.config.telegram.botToken);
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.bot) {
      console.warn('Telegram bot token not configured. Bot will not start.');
      return;
    }

    this.setupBot();
    await this.bot.launch();
    console.log('Telegram bot started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
    }
  }

  private setupBot(): void {
    // Handle /start command
    this.bot.start(async (ctx) => {
      const welcomeMessage = `
🤖 Welcome to Agentic AI!

I'm your AI assistant powered by Qwen 3.6.
Available commands:
/help - Show help
/agents - List available agents
/settings - Configure agent

Send me a message and I'll respond with AI assistance!
      `;
      await ctx.reply(welcomeMessage, Markup.inlineKeyboard([
        Markup.button.callback('Help', 'help'),
        Markup.button.callback('Agents', 'agents'),
      ]));
    });

    // Handle /help command
    this.bot.help((ctx) => {
      ctx.reply(`
📚 Help & Commands:

/start - Start the bot
/help - Show this help
/agents - List available agents
/new - Start new conversation
/clear - Clear conversation history

Just send a message to chat with the AI agent!
      `);
    });

    // Handle /agents command
    this.bot.command('agents', async (ctx) => {
      const tools = this.agentRuntime.getAvailableTools();
      const message = `
🤖 Available Agents & Tools:

Enabled tools:
${tools.map(t => `• ${t}`).join('\n') || 'No tools configured'}

Use /settings to configure agents.
      `;
      await ctx.reply(message);
    });

    // Handle callback queries
    this.bot.action('help', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.editMessageText('How can I help you? Send me a message!');
    });

    this.bot.action('agents', async (ctx) => {
      await ctx.answerCbQuery();
      const tools = this.agentRuntime.getAvailableTools();
      await ctx.editMessageText(`Active tools: ${tools.join(', ') || 'None'}`);
    });

    // Handle regular messages
    this.bot.on('text', async (ctx) => {
      try {
        const userId = ctx.from.id.toString();
        const message = ctx.message.text;

        // Show typing indicator
        await ctx.sendChatAction('typing');

        // Execute agent (using default agent for now)
        const response = await this.agentRuntime.executeAgent(
          'default-agent',
          userId,
          message,
        );

        const lastMessage = response[response.length - 1];
        await ctx.reply(lastMessage.content);
      } catch (error) {
        console.error('Error processing message:', error);
        await ctx.reply('Sorry, I encountered an error. Please try again.');
      }
    });
  }
}
