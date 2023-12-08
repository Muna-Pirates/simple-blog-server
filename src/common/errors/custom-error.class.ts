export class CustomError extends Error {
  public statusCode: number;

  constructor(public code: string, message?: string, statusCode?: number) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode || 500; // Default to 500 if not specified
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
