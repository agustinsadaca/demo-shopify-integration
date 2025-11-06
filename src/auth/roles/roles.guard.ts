import { Role } from '../../shop-connectors/shopify/entities/enums.entity'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './role.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const noAuth = this.reflector.get<boolean>(
      'no-auth',
      context.getHandler()
    )

    if (noAuth) return true

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    if (!request.user || !request.user.entityRole) {
      return false
    }

    const isRoleAllowed = requiredRoles.some((role) => request.user.entityRole === role)

    if (!isRoleAllowed) {
      return false
    }

    return true
  }
}