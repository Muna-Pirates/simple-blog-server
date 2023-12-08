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

  return {
    message,
    code,
    locations,
    path,
  };
};

const determineErrorCode = (error: GraphQLError): string => {
  if (
    typeof error.extensions?.exception === 'object' &&
    'code' in error.extensions.exception
  ) {
    return (error.extensions.exception as any).code;
  }

  if (error.message.includes('Error finding user by email'))
    return 'USER_NOT_FOUND';
  if (error.message.includes('Email already exists'))
    return 'EMAIL_ALREADY_EXISTS';
  if (error.message.includes('Error creating user')) return 'USER_NOT_CREATED';
  if (error.message.includes('Error finding user by ID'))
    return 'USER_NOT_FOUND';
  if (error.message.includes('Error finding role by ID'))
    return 'ROLE_NOT_FOUND';
  if (error.message.includes('Error finding role by name'))
    return 'ROLE_NOT_FOUND';
  if (error.message.includes('Error finding roles')) return 'ROLES_NOT_FOUND';
  if (error.message.includes('Error finding users')) return 'USERS_NOT_FOUND';
  if (error.message.includes('Error finding users by role'))
    return 'USERS_NOT_FOUND';
  if (error.message.includes('Error finding user by email'))
    return 'USER_NOT_FOUND';
  if (error.message.includes('Error finding user by ID'))
    return 'USER_NOT_FOUND';

  return 'GENERIC_ERROR';
};
