import { GraphQLError } from 'graphql';

export class CustomGraphQLError extends GraphQLError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      extensions: {
        ...extensions,
      },
    });
  }

  static formatError(error: GraphQLError) {
    const extensions = error.extensions || {};
    delete extensions.stacktrace;

    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
      extensions: extensions,
    };
  }
}
