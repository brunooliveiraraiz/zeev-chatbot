import { z } from 'zod';
import { config } from 'dotenv';

// Load .env file
config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  STAGE_DEFAULT: z.enum(['hml', 'prod']).default('hml'),
  
  // Auth
  AUTH_MODE: z.enum(['DEV', 'SIGNED_CONTEXT', 'JWT_SSO']).default('DEV'),
  CONTEXT_SIGNING_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_ISSUER: z.string().default('zeev-portal'),
  JWT_AUDIENCE: z.string().default('zeev-chatbot'),
  CHAT_SESSION_SECRET: z.string().default('dev-chat-session-secret-change-in-production'),
  CHAT_SESSION_EXPIRES_IN: z.string().default('24h'),
  
  // Zeev
  MOCK_MODE: z.coerce.boolean().default(true),
  ZEEV_BASE_URL: z.string().url().optional(),
  ZEEV_TOKEN: z.string().optional(),
  ZEEV_ENDPOINT_CREATE_INSTANCE: z.string().default('/processes/{processId}/instances'),
  ZEEV_PROCESS_ID: z.string().optional(),
  ZEEV_TIMEOUT_MS: z.coerce.number().default(10000),
  
  // Database
  DATABASE_URL: z.string().default('file:./data/chatbot.db'),
  
  // CORS
  CORS_ORIGINS: z.string().default('*'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Optional LLM
  USE_LLM: z.coerce.boolean().default(false),
  LLM_API_URL: z.string().optional(),
  LLM_API_KEY: z.string().optional(),

  // AI Troubleshooting
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_TROUBLESHOOTING_ENABLED: z.coerce.boolean().default(false),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;
