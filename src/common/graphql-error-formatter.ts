import { GraphQLError } from 'graphql';
import { LoggerService } from './logger.service';

export class EnhancedErrorFormatter {
  private logger: LoggerService;

  constructor(loggerService: LoggerService) {
    this.logger = loggerService;
  }

  public formatGraphQLError(error: GraphQLError) {
    const { message, locations, path, extensions } = error;

    const customErrorCode = this.determineErrorCode(error);

    this.logger.logError({
      message,
      locations,
      path,
      errorCode: customErrorCode,
      originalError: error,
    });

    return {
      message,
      locations,
      path,
      code: customErrorCode,
    };
  }

  private determineErrorCode(error: GraphQLError): string {
    const errorCode = error.extensions?.code;
    if (typeof errorCode === 'string') {
      return errorCode === 'INTERNAL_SERVER_ERROR'
        ? 'BUSINESS_CRITICAL_ERROR'
        : errorCode;
    }

    return 'UNHANDLED_ERROR';
  }
}
