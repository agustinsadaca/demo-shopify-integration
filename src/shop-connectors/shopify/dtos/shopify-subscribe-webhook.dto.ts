import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'

enum Domains {
  STAGING = 'https://shopify.staging.demo',
  PROD = 'https://shopify.prod.demo'
}

export class ShopifySubscribeWebhookDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  implementationId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  topic: string

  @ApiProperty({ required: true, enum: Domains })
  @IsNotEmpty()
  @IsString()
  @IsEnum(Domains)
  callbackUrl: string
}
