import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(GraphQLError)
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: GraphQLError, host: ArgumentsHost) {
    console.error(exception, '@@@');

    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();
    const response = context.res;
    const message = exception.message;
    const code = exception.extensions?.code || 'Internal Server Error';

    const userFriendlyMessage = `An error occurred: ${message}. Please check your request and try again.`;

    throw new HttpException(userFriendlyMessage, HttpStatus.BAD_REQUEST);
  }
}
