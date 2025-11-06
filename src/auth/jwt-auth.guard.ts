import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'
@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super() }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (process.env.stage === 'local') {
      this.injectUserToRequest(context)
    }

    const noAuth = this.reflector.get<boolean>(
      'no-auth',
      context.getHandler()
    ) || (process.env.stage === 'local')

    if (noAuth) return true

    return super.canActivate(context)
  }

  private injectUserToRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    request.user = {
      entityId: parseInt(process.env.entity_id!),
      entityRole: process.env.entity_role,
      implementationIds: process.env.implementation_ids
    }
  }
}