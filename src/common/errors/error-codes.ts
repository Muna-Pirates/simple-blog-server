export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  GRAPHQL_QUERY_ERROR = 'GRAPHQL_QUERY_ERROR',
  PRISMA_ERROR = 'PRISMA_ERROR',
  UNIQUE_CONSTRAINT_FAILED = 'UNIQUE_CONSTRAINT_FAILED',
  FOREIGN_KEY_CONSTRAINT_FAILED = 'FOREIGN_KEY_CONSTRAINT_FAILED',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  PRISMA_UNKNOWN_ERROR = 'PRISMA_UNKNOWN_ERROR',
  GRAPHQL_VALIDATION_FAILED = 'GRAPHQL_VALIDATION_FAILED',
  GRAPHQL_AUTHENTICATION_ERROR = 'GRAPHQL_AUTHENTICATION_ERROR',
}
