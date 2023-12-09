import { GraphQLError } from 'graphql';
import { LoggerService } from './logger.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type PrismaErrorCode = 'P2002' | 'P2003'; // Extend as needed
type ErrorCode =
  | 'UNIQUE_CONSTRAINT_FAILED'
  | 'FOREIGN_KEY_CONSTRAINT_FAILED'
  | 'DATABASE_ERROR'
  | 'BUSINESS_CRITICAL_ERROR'
  | 'UNHANDLED_ERROR';

export class EnhancedErrorFormatter {
  private prismaErrorMapping: Record<PrismaErrorCode, ErrorCode> = {
    P2002: 'UNIQUE_CONSTRAINT_FAILED',
    P2003: 'FOREIGN_KEY_CONSTRAINT_FAILED',
    // Add more detailed Prisma error mappings here
  };

  constructor(private logger: LoggerService) {}

  public formatGraphQLError(error: GraphQLError): any {
    const customErrorCode = this.determineErrorCode(error);
    const userFriendlyMessage =
      this.generateUserFriendlyMessage(customErrorCode);

    this.logErrorDetails(error, customErrorCode);

    return {
      ...this.extractErrorDetails(error),
      message: this.formatErrorMessage(error.message, customErrorCode),
      userFriendlyMessage,
      code: customErrorCode,
    };
  }

  private determineErrorCode(error: GraphQLError): ErrorCode {
    const errorCode =
      typeof error.extensions?.code === 'string'
        ? error.extensions.code
        : undefined;

    if (error.originalError instanceof PrismaClientKnownRequestError) {
      return this.mapPrismaErrorCode(error.originalError.code);
    }
    return this.isInternalError(errorCode)
      ? 'BUSINESS_CRITICAL_ERROR'
      : 'UNHANDLED_ERROR';
  }

  private mapPrismaErrorCode(prismaErrorCode: string): ErrorCode {
    return (
      this.prismaErrorMapping[prismaErrorCode as PrismaErrorCode] ||
      'DATABASE_ERROR'
    );
  }

  private isInternalError(code?: string | undefined): boolean {
    return code === 'INTERNAL_SERVER_ERROR';
  }

  private formatErrorMessage(message: string, errorCode: ErrorCode): string {
    return errorCode === 'BUSINESS_CRITICAL_ERROR'
      ? `Critical: ${message}`
      : message;
  }

  private generateUserFriendlyMessage(errorCode: ErrorCode): string {
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

  private extractErrorDetails(error: GraphQLError) {
    const { message, locations, path } = error;
    return { message, locations, path };
  }

  private logErrorDetails(error: GraphQLError, errorCode: ErrorCode): void {
    this.logger.logError({
      ...this.extractErrorDetails(error),
      errorCode,
      originalError: error,
    });
  }
}
