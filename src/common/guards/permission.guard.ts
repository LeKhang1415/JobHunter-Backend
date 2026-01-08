import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission || requiredPermission.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    const method = request.method;
    const path = request.route?.path;

    const hasPermission = user.permissions.some((permission) => {
      const [permMethod, permPath] = permission.split(' ');

      if (permMethod !== method) return false;

      // So sánh path với pattern matching
      return this.matchPath(permPath, path);
    });

    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    return true;
  }

  private matchPath(pattern: string, path: string): boolean {
    const regexPath = pattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${regexPath}$`);
    return regex.test(path);
  }
}
