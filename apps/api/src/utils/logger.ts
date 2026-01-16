import { env } from '../config/env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = levels[env.LOG_LEVEL];

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (levels[level] >= currentLevel) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(prefix, message, ...args);
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
};
