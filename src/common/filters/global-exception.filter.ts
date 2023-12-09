// /path/to/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();
    const response: Response = context.res;
    const request: Request = context.req;

    // Standardizing response format for both REST and GraphQL
    const { status, message } = exception.getResponse() as {
      status: number;
      message: string[] | string;
    };

    // Enhanced error response format
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url, // Extracting URL from REST or GraphQL request
      message: Array.isArray(message) ? message : [message],
    };

    // Additional error logging
    this.logger.error({
      message: 'Exception caught',
      exception: errorResponse,
      context: request ? 'REST' : 'GraphQL',
    });

    // For GraphQL requests, throw a formatted error
    if (!response) {
      throw new HttpException(errorResponse, status);
    }

    // For REST requests, send a formatted response
    response.status(status).json(errorResponse);
  }
}
