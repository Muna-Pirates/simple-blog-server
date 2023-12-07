import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CustomGraphQLError } from '../errors/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: unknown, host: ArgumentsHost) {
    let errorResponse;

    if (exception instanceof PrismaClientKnownRequestError) {
      errorResponse = this.formatErrorResponse(
        `Prisma error: ${exception.message}`,
        'PRISMA_ERROR',
        { prismaCode: exception.code },
      );
    } else if (exception instanceof GraphQLError) {
      errorResponse = this.formatErrorResponse(
        exception.message,
        'GRAPHQL_ERROR',
        exception.extensions,
      );
    } else if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      errorResponse = this.formatErrorResponse(
        exception.getResponse()['message'] || exception.message,
        'HTTP_ERROR',
        { statusCode },
      );
    } else if (exception instanceof Error) {
      errorResponse = this.formatErrorResponse(
        exception.message,
        'INTERNAL_SERVER_ERROR',
      );
    } else {
      errorResponse = this.formatErrorResponse(
        'Unknown error occurred',
        'INTERNAL_SERVER_ERROR',
      );
    }

    return errorResponse;
  }

  private formatErrorResponse(
    message: string,
    code: string,
    additionalDetails: Record<string, unknown> = {},
  ) {
    return new CustomGraphQLError(message, {
      code,
      ...additionalDetails,
    });
  }
}
