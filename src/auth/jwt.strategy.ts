import { JwtUser } from '../core/types/common.types'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '../config.service'

const jwtEntityRole = 'custom:entityRole'
const jwtEntityId = 'custom:entityId'
const jwtImplementationIds = 'custom:implementationIds'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${ConfigService.cognitoConfig().authority}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: ConfigService.cognitoConfig().clientId,
      issuer: ConfigService.cognitoConfig().authority,
      algorithms: ['RS256'],
    })
  }

  public async validate(payload: any) {
    const jwtUser: JwtUser = { 
      id: payload.sub || 0,
      email: payload.email || '',
      role: payload[jwtEntityRole] || 'ShopUser',
      entityRole: payload[jwtEntityRole],
      entityId: payload[jwtEntityId],
      implementationId: payload.implementationId || 0,
      implementationIds: payload[jwtImplementationIds],
      organizationId: payload.organizationId
    }
    return jwtUser
  }
}