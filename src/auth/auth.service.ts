import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient as CognitoIdentityServiceProvider
} from '@aws-sdk/client-cognito-identity-provider'
import { CredsDto } from './dtos/creds.dto'
import { JwtUser } from '../core/types/common.types'
import { Role } from '../shop-connectors/shopify/entities/enums.entity'
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool
} from 'amazon-cognito-identity-js'
import { CustomUserAttributeDto } from './dtos/custom-user-attribute.dto'
// Removed missing DTOs

const AuthAction = {
  create: 'create',
  update: 'update'
}

type AuthResponseType = {
  message?: string
  data?: any
  error?: any
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  userPoolId = process.env[`demo_shopify_cognito_user_pool_id_${process.env.stage}`]

  constructor(
    private readonly userPool: CognitoUserPool,
    private readonly cognitoIdentityServiceProvider: CognitoIdentityServiceProvider
  ) {}

  authenticateUser(credsDto: CredsDto) {
    const { email, password } = credsDto

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    })
    const userData = {
      Username: email,
      Pool: this.userPool
    }

    const newUser = new CognitoUser(userData)

    return new Promise((resolve, reject) => {
      return newUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result)
        },
        onFailure: (err) => {
          reject(new UnauthorizedException(err))
        }
      })
    })
  }

  async registerUser(
    registerUserDto: any,
    userHeaders: JwtUser
  ): Promise<AuthResponseType> {
    try {
      const { email, password, entityRole, entityId, implementationIds, tenantEmail } =
        registerUserDto

      if (userHeaders.entityRole === Role.TenantUser && entityRole !== Role.ShopUser) {
        throw new BadRequestException('Only shop user are allowed to be created by tenant user')
      }

      if (userHeaders.entityRole === Role.TenantUser && !tenantEmail) {
        throw new BadRequestException('tenantEmail is required')
      }

      const attributeList = this.getCognitoUserAttributes(
        { entityId: entityId.toString(), entityRole, implementationIds },
        AuthAction.create
      )

      const createUserParams: AdminCreateUserCommandInput = {
        UserPoolId: this.userPoolId,
        Username: email,
        TemporaryPassword: password,
        UserAttributes: attributeList,
        MessageAction: 'SUPPRESS'
      }

      try {
        await this.cognitoIdentityServiceProvider.send(new AdminCreateUserCommand(createUserParams))
      } catch (error) {
        return {
          error: error?.message
        }
      }

      var setUserPasswordParams = {
        Password: password,
        UserPoolId: this.userPoolId,
        Username: email,
        Permanent: true
      }

      await this.cognitoIdentityServiceProvider.send(
        new AdminSetUserPasswordCommand(setUserPasswordParams)
      )

      if (userHeaders.entityRole === Role.TenantUser && tenantEmail) {
        this.logger.log(
          `Updating tenant user ${tenantEmail} with implementationIds ${implementationIds}`
        )
        await this.updateUser({
          email: tenantEmail,
          entityId: userHeaders.entityId,
          entityRole: Role.TenantUser,
          implementationIds: userHeaders.implementationIds
            ? `${userHeaders.implementationIds},${implementationIds}`
            : implementationIds
        })
      }

      return {
        message: 'User is registered successfully',
        data: {
          email,
          entityId,
          entityRole,
          implementationIds
        }
      }
    } catch (error) {
      throw error
    }
  }

  async updateUser(updateUserDto: any): Promise<any> {
    try {
      const { email, entityRole, entityId, implementationIds } = updateUserDto

      const attributeList = this.getCognitoUserAttributes(
        { entityId: entityId?.toString(), entityRole, implementationIds },
        AuthAction.update
      )

      const updateUserParams = {
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: attributeList
      }

      await this.cognitoIdentityServiceProvider.send(
        new AdminUpdateUserAttributesCommand(updateUserParams)
      )
      this.logger.log(`Updated user ${email} with implementationIds ${implementationIds}`)
    } catch (error) {
      throw error
    }
  }

  private getCognitoUserAttributes(
    customUserAttributeDto: CustomUserAttributeDto,
    action: string
  ): any[] {
    const attributeList: CognitoUserAttribute[] = []
    for (const attributeKey in customUserAttributeDto) {
      if (
        customUserAttributeDto.entityRole === Role.TenantUser &&
        attributeKey === 'implementationIds' // initially for new tenant user, implementationIds will be '' (empty string)
      ) {
      } else if (action === AuthAction.create && !customUserAttributeDto[attributeKey]) {
        throw new Error(`${attributeKey} is empty`)
      }
      const attribute = this.mapCognitoUserAttribute(
        attributeKey,
        customUserAttributeDto[attributeKey]
      )
      if (!attribute.Value) continue
      attributeList.push(attribute)
    }
    return attributeList
  }

  private mapCognitoUserAttribute(attributeKey: string, value: any) {
    return new CognitoUserAttribute({ Name: `custom:${attributeKey}`, Value: value })
  }
}
