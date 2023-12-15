import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const type = host.getType<GqlContextType>();

    if (type === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);
      const gqlContext = gqlHost.getContext();
      const graphQLError = this.formatGqlError(exception);

      if (gqlContext.res) {
        gqlContext.res.status(200).json({ errors: [graphQLError] });
      }
    } else {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      if (response) {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: this.getErrorMessage(exception),
        });
      }
    }
  }

  private formatGqlError(exception: unknown): GraphQLError {
    return exception instanceof GraphQLError
      ? exception
      : new GraphQLError('An unknown error occurred');
  }

  private getErrorMessage(exception: unknown): string {
    return exception instanceof Error ? exception.message : 'Unknown error';
  }
}
