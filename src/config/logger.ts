import { env } from './env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private isDevelopment = env.NODE_ENV === 'development';
    private isTest = env.NODE_ENV === 'test';

    private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        return `${prefix} ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    }

    info(message: string, ...args: any[]): void {
        if (!this.isTest) {
            console.log(this.formatMessage('info', message, ...args));
        }
    }

    warn(message: string, ...args: any[]): void {
        if (!this.isTest) {
            console.warn(this.formatMessage('warn', message, ...args));
        }
    }

    error(message: string, ...args: any[]): void {
        if (!this.isTest) {
            console.error(this.formatMessage('error', message, ...args));
        }
    }

    debug(message: string, ...args: any[]): void {
        if (this.isDevelopment && !this.isTest) {
            console.debug(this.formatMessage('debug', message, ...args));
        }
    }

    log(message: string, ...args: any[]): void {
        this.info(message, ...args);
    }
}

export const logger = new Logger();

