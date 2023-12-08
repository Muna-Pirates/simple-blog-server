// path/filename: src/common/filters/graphql-exception.filter.ts

import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(GraphQLError)
export class GraphqlExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: GraphQLError, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    // Additional logic can be added here to handle errors in a way that's
    // tailored for large-scale applications, such as logging or custom error formatting.

    // Extract useful information from the GraphQLError
    const formattedError = {
      message: exception.message,
      locations: exception.locations,
      path: exception.path,
      extensions: exception.extensions,
    };

    // In a real-world large-scale application, more complex error handling and reporting can be added here.

    // Return the error in a GraphQL-compliant format
    return formattedError;
  }
}
