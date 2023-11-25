// /path/to/role.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GqlRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      throw new UnauthorizedException();
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
