import { CognitoIdentityProviderClient as CognitoIdentityServiceProvider } from '@aws-sdk/client-cognito-identity-provider'
import { JwtUser, Role } from '@digital-logistics-gmbh/wh1plus-common'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CognitoUserPool } from 'amazon-cognito-identity-js'
import { MockType } from '../../test/utils/mock-type'
import { AuthService } from './auth.service'
import { RegisterUserDto } from './dtos/register-user.dto'

describe('AuthService', () => {
  let service: AuthService
  let cognitoIdentityServiceProvider: CognitoIdentityServiceProvider

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CognitoUserPool,
          useFactory: cognitoUserPoolFactory
        },
        {
          provide: CognitoIdentityServiceProvider,
          useFactory: cognitoIdentityServiceFactory
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    cognitoIdentityServiceProvider = module.get(CognitoIdentityServiceProvider)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('registerUser', () => {
    const mockRegisterUserDto: RegisterUserDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      entityRole: Role.TenantUser,
      entityId: 123,
      implementationIds: '1'
    }

    const mockUserHeaders: JwtUser = {
      entityId: 456,
      entityRole: Role.AdminUser,
      implementationIds: '1,2,3'
    }

    it('should successfully register a user when all parameters are valid', async () => {
      const createUserSpy = jest.spyOn(cognitoIdentityServiceProvider, 'send')

      const result = await service.registerUser(mockRegisterUserDto, mockUserHeaders)

      expect(createUserSpy).toHaveBeenCalledTimes(2)

      expect(result).toEqual({
        message: 'User is registered successfully',
        data: {
          email: mockRegisterUserDto.email,
          entityId: mockRegisterUserDto.entityId,
          entityRole: mockRegisterUserDto.entityRole,
          implementationIds: mockRegisterUserDto.implementationIds
        }
      })
    })

    it('should throw BadRequestException when tenant user tries to create non-shop user', async () => {
      const tenantUserHeaders: JwtUser = {
        entityId: 456,
        entityRole: Role.TenantUser,
        implementationIds: '1,2,3'
      }

      const registerDtoWithPartnerRole: RegisterUserDto = {
        ...mockRegisterUserDto,
        entityRole: Role.PartnerUser
      }

      await expect(
        service.registerUser(registerDtoWithPartnerRole, tenantUserHeaders)
      ).rejects.toThrow(
        new BadRequestException('Only shop user are allowed to be created by tenant user')
      )
    })

    it('should allow tenant user to create shop user', async () => {
      const registerDtoWithShopRole: RegisterUserDto = {
        ...mockRegisterUserDto,
        entityRole: Role.ShopUser,
        tenantEmail: 'tenant@example.com'
      }

      const tenantUserHeaders: JwtUser = {
        entityId: 456,
        entityRole: Role.TenantUser,
        implementationIds: '1,2,3'
      }

      const createUserSpy = jest.spyOn(cognitoIdentityServiceProvider, 'send')

      const result = await service.registerUser(registerDtoWithShopRole, tenantUserHeaders)

      expect(createUserSpy).toHaveBeenCalledTimes(3)
      expect(result.message).toBe('User is registered successfully')
    })
  })
})

const cognitoUserPoolFactory: () => MockType<CognitoUserPool> = jest.fn(() => ({}))

const cognitoIdentityServiceFactory: () => MockType<CognitoIdentityServiceProvider> = jest.fn(
  () => ({
    send: jest.fn()
  })
)
