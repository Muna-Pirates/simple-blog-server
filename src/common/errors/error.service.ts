// src/error.service.ts
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
        return this.handlePrismaError(
          internalError as PrismaClientKnownRequestError,
        );
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): ErrorCode {
    // Example: handle specific Prisma errors (extend as needed)
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        return ErrorCode.VALIDATION_ERROR;
      default:
        return ErrorCode.PRISMA_ERROR;
    }
  }
}
