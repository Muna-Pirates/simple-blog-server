// path/filename: /src/utils/formatGraphQLError.ts

import { GraphQLError } from 'graphql';

interface CustomGraphQLErrorFormat {
  message: string;
  code: string;
  locations?: { line: number; column: number }[];
  path?: string[];
}

export const formatGraphQLError = (
  error: GraphQLError,
): CustomGraphQLErrorFormat => {
  const message = error.message;
  const code = determineErrorCode(error);

  const locations = error.locations
    ? error.locations.map((loc) => ({ line: loc.line, column: loc.column }))
    : undefined;

  const path = error.path ? error.path.map((p) => p.toString()) : undefined;

  return { message, code, locations, path };
};

const determineErrorCode = (error: GraphQLError): string => {
  // Check for a code in the error extensions
  if (
    typeof error.extensions?.exception === 'object' &&
    'code' in error.extensions.exception
  ) {
    return (error.extensions.exception as any).code;
  }

  // Error message patterns and corresponding codes
  const errorPatterns = [
    { pattern: 'Error finding user by email', code: 'USER_NOT_FOUND' },
    { pattern: 'Email already exists', code: 'EMAIL_ALREADY_EXISTS' },
    { pattern: 'Error creating user', code: 'USER_NOT_CREATED' },
    { pattern: 'Error finding user by ID', code: 'USER_NOT_FOUND' },
    { pattern: 'Error finding role by ID', code: 'ROLE_NOT_FOUND' },
    { pattern: 'Error finding role by name', code: 'ROLE_NOT_FOUND' },
    { pattern: 'Error finding roles', code: 'ROLES_NOT_FOUND' },
    { pattern: 'Error finding users', code: 'USERS_NOT_FOUND' },
    { pattern: 'Error finding users by role', code: 'USERS_NOT_FOUND' },
    // Add additional patterns as needed
  ];

  // Determine the error code based on the message pattern
  for (const { pattern, code } of errorPatterns) {
    if (error.message.includes(pattern)) {
      return code;
    }
  }

  // Default error code
  return 'GENERIC_ERROR';
};
