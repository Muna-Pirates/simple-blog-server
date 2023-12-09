// path/filename: src/enhanced-error-formatter.ts
import { GraphQLError } from 'graphql';
import { LoggerService } from './logger.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class EnhancedErrorFormatter {
  constructor(private logger: LoggerService) {}

  public formatGraphQLError(error: GraphQLError): any {
    const { message, locations, path } = error;
    const customErrorCode = this.determineErrorCode(error);
    const userFriendlyMessage =
      this.generateUserFriendlyMessage(customErrorCode);

    this.logErrorDetails(error, customErrorCode);

    return {
      message: this.formatErrorMessage(message, customErrorCode),
      userFriendlyMessage,
      locations,
      path,
      code: customErrorCode,
    };
  }

  private determineErrorCode(error: GraphQLError): string {
    const prismaError = error.originalError as PrismaClientKnownRequestError;
    const errorCode =
      typeof error.extensions?.code === 'string'
        ? error.extensions.code
        : 'UNHANDLED_ERROR';

    if (prismaError?.code) {
      return this.mapPrismaErrorCode(prismaError.code);
    }

    return errorCode === 'INTERNAL_SERVER_ERROR'
      ? 'BUSINESS_CRITICAL_ERROR'
      : errorCode;
  }

  private mapPrismaErrorCode(prismaErrorCode: string): string {
    const prismaErrorMapping: Record<string, string> = {
      P2002: 'UNIQUE_CONSTRAINT_FAILED',
      P2003: 'FOREIGN_KEY_CONSTRAINT_FAILED',
      // Add more detailed Prisma error mappings here
    };

    return prismaErrorMapping[prismaErrorCode] || 'DATABASE_ERROR';
  }

  private formatErrorMessage(message: string, errorCode: string): string {
    return errorCode === 'BUSINESS_CRITICAL_ERROR'
      ? `Critical: ${message}`
      : message;
  }

  private generateUserFriendlyMessage(errorCode: string): string {
    switch (errorCode) {
      case 'UNIQUE_CONSTRAINT_FAILED':
        return 'A unique constraint was violated. Please verify your input.';
      case 'FOREIGN_KEY_CONSTRAINT_FAILED':
        return 'A foreign key constraint was violated. Please check related records.';
      case 'DATABASE_ERROR':
        return 'A database error occurred. We are working to resolve this issue.';
      default:
        return 'An unexpected error occurred. Our team is looking into it.';
    }
  }

  private logErrorDetails(error: GraphQLError, errorCode: string): void {
    const { message, locations, path } = error;
    this.logger.logError({
      message,
      locations,
      path,
      errorCode,
      originalError: error,
    });
  }
}
