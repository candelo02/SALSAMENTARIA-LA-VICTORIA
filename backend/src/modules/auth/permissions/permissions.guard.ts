import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permissions.decorator';
import { PermissionEnum } from './permissions.enum';
import { hasPermission } from './permission-matrix';
import { RoleEnum } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionEnum[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Acceso denegado: Usuario no autenticado o sin rol asignado.');
    }

    const userRole = user.role as RoleEnum;

    const hasAllPermissions = requiredPermissions.every((perm) =>
      hasPermission(userRole, perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Acceso denegado: El rol ${userRole} no posee los permisos requeridos [${requiredPermissions.join(', ')}].`,
      );
    }

    return true;
  }
}
