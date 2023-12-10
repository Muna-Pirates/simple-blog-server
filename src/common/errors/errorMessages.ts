type ErrorCode =
  | 'UNIQUE_CONSTRAINT_FAILED'
  | 'FOREIGN_KEY_CONSTRAINT_FAILED'
  | 'DATABASE_ERROR'
  | 'BUSINESS_CRITICAL_ERROR'
  | 'UNHANDLED_ERROR';

export const errorMessages: Record<ErrorCode, string> = {
  UNIQUE_CONSTRAINT_FAILED:
    'A unique constraint was violated. Please verify your input.',
  FOREIGN_KEY_CONSTRAINT_FAILED:
    'A foreign key constraint was violated. Please check related records.',
  DATABASE_ERROR:
    'A database error occurred. We are working to resolve this issue.',
  BUSINESS_CRITICAL_ERROR: 'A critical error occurred. Please contact support.',
  UNHANDLED_ERROR: 'An unexpected error occurred. Our team is looking into it.',
};
