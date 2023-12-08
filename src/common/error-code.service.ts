export class ErrorCodeService {
  private errorCodeMap: { [key: string]: string } = {
    NOT_FOUND: '404',
    UNAUTHORIZED: '401',
    FORBIDDEN: '403',
    // Define more error codes as needed
  };

  getCode(errorKey: string): string {
    return this.errorCodeMap[errorKey] || '500'; // Default to 500 if no specific error code is found
  }
}
