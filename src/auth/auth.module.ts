import { CognitoIdentityProviderClient as CognitoIdentityServiceProvider } from "@aws-sdk/client-cognito-identity-provider"
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport/dist/passport.module'
import { CognitoUserPool, ICognitoUserPoolData } from 'amazon-cognito-identity-js'
import { ConfigService } from '../config.service'
import { mainConfigs } from '../config/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import JwtAuthGuard from './jwt-auth.guard'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, CognitoUserPool,
    {
      provide: CognitoUserPool,
      useFactory: (data: ICognitoUserPoolData) => {
        return new CognitoUserPool({
          UserPoolId: process.env[`demo_shopify_cognito_user_pool_id_${process.env.stage}`]!,
          ClientId: process.env[`demo_shopify_cognito_client_id_${process.env.stage}`]!,
        })
      }
    },
    {
      provide: CognitoIdentityServiceProvider,
      useFactory: () => {
        const demoShopifyAwsCreds = ConfigService.getAwsKeyAndSecret()
        return new CognitoIdentityServiceProvider({
          credentials: {
            accessKeyId: demoShopifyAwsCreds.aws_key,
            secretAccessKey: demoShopifyAwsCreds.aws_secret,
          },
          apiVersion: mainConfigs.aws_api_version,
          region: process.env.region
        })
      }
    }
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }