import { GraphQLError } from 'graphql';
import { ValidationError } from 'class-validator';
import { LoggerService } from './logger.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { errorMessages } from './errors/errorMessages';

type ClassValidatorErrorCode = 'VALIDATION_FAILED';
type PrismaErrorCode = 'P2002' | 'P2003';
type ErrorCode =
  | 'UNIQUE_CONSTRAINT_FAILED'
  | 'FOREIGN_KEY_CONSTRAINT_FAILED'
  | 'DATABASE_ERROR'
  | 'BUSINESS_CRITICAL_ERROR'
  | 'UNHANDLED_ERROR'
  | ClassValidatorErrorCode;

export class EnhancedErrorFormatter {
  private prismaErrorMapping: Record<PrismaErrorCode, ErrorCode> = {
    P2002: 'UNIQUE_CONSTRAINT_FAILED',
    P2003: 'FOREIGN_KEY_CONSTRAINT_FAILED',
  };

  constructor(private logger: LoggerService) {}

  public formatGraphQLError(error: GraphQLError): any {
    const customErrorCode = this.determineErrorCode(error);
    const userFriendlyMessage = errorMessages[customErrorCode];

    this.logErrorDetails(error, customErrorCode);

    return {
      ...this.extractErrorDetails(error),
      message: this.formatErrorMessage(error.message, customErrorCode),
      userFriendlyMessage,
      code: customErrorCode,
    };
  }

  private determineErrorCode(error: GraphQLError): ErrorCode {
    if (error.originalError instanceof ValidationError) {
      return 'VALIDATION_FAILED';
    } else if (error.originalError instanceof PrismaClientKnownRequestError) {
      return this.mapPrismaErrorCode(error.originalError.code);
    }

    const errorCode =
      typeof error.extensions?.code === 'string'
        ? error.extensions.code
        : undefined;

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
