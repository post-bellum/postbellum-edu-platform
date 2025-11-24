/**
 * Logger utility for consistent logging across the application
 * In production, you can integrate with services like Sentry, LogRocket, etc.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, data?: unknown) {
    if (!this.isDevelopment && level === 'debug') {
      return // Skip debug logs in production
    }

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case 'error':
        console.error(prefix, message, data || '')
        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        break
      case 'warn':
        console.warn(prefix, message, data || '')
        break
      case 'info':
        console.info(prefix, message, data || '')
        break
      case 'debug':
        console.debug(prefix, message, data || '')
        break
    }
  }

  error(message: string, error?: unknown) {
    this.log('error', message, error)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data)
  }
}

export const logger = new Logger()

