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

    const { status, message } = exception.getResponse() as {
      status: number;
      message: string[] | string;
    };

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      message: Array.isArray(message) ? message : [message],
    };

    this.logger.error({
      message: 'Exception caught',
      exception: errorResponse,
      context: request ? 'REST' : 'GraphQL',
    });

    if (!response) {
      throw new HttpException(errorResponse, status);
    }

    response.status(status).json(errorResponse);
  }
}
