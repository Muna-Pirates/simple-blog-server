// src/common/errors/custom-error-handler.ts

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ValidationError } from 'class-validator';

@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: unknown, host: ArgumentsHost) {
    let response;

    if (exception instanceof HttpException) {
      response = {
        statusCode: exception.getStatus(),
        message: exception.getResponse(),
      };
    } else if (exception instanceof PrismaClientKnownRequestError) {
      response = {
        statusCode: 500,
        message: exception.message,
        code: exception.code,
      };
    } else if (exception instanceof ValidationError) {
      response = { statusCode: 400, message: exception.constraints };
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception
    ) {
      const error = exception as { message: string; code?: string };
      response = { statusCode: 500, message: error.message, code: error.code };
    } else {
      response = { statusCode: 500, message: 'Internal server error' };
    }

    const standardizedResponse = {
      code: response.statusCode,
      error: response.message,
    };

    const context = host.switchToHttp().getRequest();
    if (context) {
      host
        .switchToHttp()
        .getResponse()
        .status(response.statusCode)
        .json(standardizedResponse);
    } else {
      return new HttpException(standardizedResponse, response.statusCode);
    }
  }
}
