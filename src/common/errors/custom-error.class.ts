export class CustomError extends Error {
  constructor(public code: string, message?: string) {
    super(message);
    this.name = 'CustomError';
    // Maintaining proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
