import { Injectable } from '@nestjs/common';
import { ErrorCode } from './error-codes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ErrorService {
  getErrorCode(internalError: Error): ErrorCode {
    switch (internalError.name) {
      case 'NotFoundError':
        return ErrorCode.NOT_FOUND;
      case 'ValidationError':
        return ErrorCode.VALIDATION_ERROR;
      case 'AuthorizationError':
        return ErrorCode.AUTHORIZATION_ERROR;
      case 'PrismaClientKnownRequestError':
        return this.handlePrismaError(internalError as PrismaClientKnownRequestError);
      case 'GraphQLQueryError':
        return ErrorCode.GRAPHQL_QUERY_ERROR;
      case 'GraphQLValidationFailed':
        return ErrorCode.GRAPHQL_VALIDATION_FAILED;
      case 'GraphQLAuthenticationError':
        return ErrorCode.GRAPHQL_AUTHENTICATION_ERROR;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): ErrorCode {
    switch (error.code) {
      case 'P2002':
        return ErrorCode.VALIDATION_ERROR;
      case 'P2003':
        return ErrorCode.DATABASE_ERROR;
      case 'P2025':
        return ErrorCode.NOT_FOUND;
      case 'P2001':
        return ErrorCode.RECORD_NOT_FOUND;
      case 'P2004':
        return ErrorCode.UNIQUE_CONSTRAINT_FAILED;
      case 'P2006':
        return ErrorCode.FOREIGN_KEY_CONSTRAINT_FAILED;
      default:
        return ErrorCode.PRISMA_UNKNOWN_ERROR;
    }
}
