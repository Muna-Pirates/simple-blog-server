import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import { ErrorCodeService } from '../error-code.service';
import { CustomError } from '../errors/custom-error.class';

@Catch(Error)
export class GraphqlExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  constructor(private errorCodeService: ErrorCodeService) {}

  catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      return exception;
    }

    let response;

    if (exception instanceof CustomError) {
      // CustomError handling
      const code = this.errorCodeService.getCode(exception.code);
      response = {
        message: exception.message || 'An error occurred',
        code: code,
      };
    } else {
      // Default error handling
      response = {
        message: 'Internal Server Error',
        code: '500',
      };
    }

    return response;
  }
}
