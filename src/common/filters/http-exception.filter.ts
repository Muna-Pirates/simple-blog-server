import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  GqlArgumentsHost,
  GqlContextType,
  GqlExceptionFilter,
} from '@nestjs/graphql';
import { GraphQLFormattedError } from 'graphql';

@Catch(HttpException)
export class HttpExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(
    exception: HttpException,
    host: ArgumentsHost,
  ): GraphQLFormattedError | void {
    console.log(exception);

    const gqlHost = GqlArgumentsHost.create(host);

    const response = exception.getResponse();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      typeof response === 'string' ? response : response['message'];
    const error = typeof response === 'string' ? 'Error' : response['error'];

    if (gqlHost.getType<GqlContextType>() === 'graphql') {
      return {
        message: message || 'Error occurred',
        extensions: {
          code: status.toString(),
          details: error,
        },
      };
    }
  }
}
