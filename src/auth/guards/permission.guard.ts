import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permisos) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    const hasPermission = requiredPermissions.some((permission) =>
      user.permisos.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Necesitas uno de estos permisos: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
