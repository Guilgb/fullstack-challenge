import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../enums/roles.enum';
import { AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userPermissions = this.getRolePermissions(user.role);

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Acesso negado. Permissões necessárias: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  // todo melhoria futura: buscar permissões do banco de dados
  private getRolePermissions(role: UserRole | string): string[] {
    const rolePermissionsMap: Record<string, string[]> = {
      [UserRole.ADMIN]: ['read', 'write', 'delete', 'manage_users'],
      [UserRole.USER]: ['read', 'write'],
    };

    return rolePermissionsMap[role] || [];
  }
}
