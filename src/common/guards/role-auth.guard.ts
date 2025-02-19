import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorater/role.customize'; // Tạo metadata key cho roles

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy metadata của roles từ route handler
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    // Nếu không có roles yêu cầu, thì cho phép truy cập
    if (!roles) {
      return true;
    }

    // Lấy request từ context
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy thông tin user từ request (được gắn bởi JwtAuthGuard)

    console.log(user, 'ssss');

    const hasRole = roles.some((role) => user.role?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the necessary role to access this resource',
      );
    }

    return true;
  }
}
