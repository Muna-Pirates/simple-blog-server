import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { ErrorCodeService } from '../error-code.service';
import { CustomError } from '../errors/custom-error.class';
import { GraphQLError } from 'graphql';

@Catch(CustomError)
export class GraphQLErrorFilter implements ExceptionFilter {
  constructor(private errorCodeService: ErrorCodeService) {}

  catch(exception: CustomError) {
    // Provide a structured error response
    return new GraphQLError(exception.message || 'Internal Server Error', {
      extensions: {
        code: exception.code,
        // Optionally include stack trace in development mode
        stacktrace:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      },
    });
  }
}
