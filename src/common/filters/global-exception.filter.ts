import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorCodeService } from '../error-code.service';
import { CustomError } from '../errors/custom-error.class';

@Injectable()
export class GraphQLErrorInterceptor implements NestInterceptor {
  constructor(private errorCodeService: ErrorCodeService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof CustomError) {
          const gqlContext = GqlExecutionContext.create(context);
          const response = gqlContext.getContext().res;
          const errorCode = this.errorCodeService.getCode(error.code);
          response.status(errorCode);
          return throwError(() => new Error(error.message));
        }
        return throwError(() => error);
      }),
    );
  }
}
