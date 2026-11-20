import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@lms/db';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user, userRole } = context.switchToHttp().getRequest();
    const effectiveRole: Role = userRole || user?.role;

    if (!effectiveRole) {
      throw new ForbiddenException('No active role found for this tenant context');
    }

    // SUPER_ADMIN has platform-wide access
    if (effectiveRole === Role.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.includes(effectiveRole);
    if (!hasRole) {
      throw new ForbiddenException(`Requires one of roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
