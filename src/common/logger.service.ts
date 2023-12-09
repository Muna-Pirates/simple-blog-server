export class LoggerService {
  constructor(private externalLoggingService?: any) {}

  public logInfo(message: string, context?: any): void {
    console.info(`Info: ${message}`, context);
    this.externalLog('info', message, context);
  }

  public logWarning(message: string, context?: any): void {
    console.warn(`Warning: ${message}`, context);
    this.externalLog('warning', message, context);
  }

  public logError(details: {
    message: string;
    locations?: any;
    path?: any;
    errorCode?: string;
    originalError?: Error;
  }): void {
    console.error(`Error: ${details.message}`, details);
    this.externalLog('error', details.message, details);
  }

  private externalLog(level: string, message: string, details?: any): void {
    if (this.externalLoggingService) {
      this.externalLoggingService.log(level, message, details);
    }
  }
}
