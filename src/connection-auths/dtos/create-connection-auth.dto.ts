import { OrgType, TargetSystemEnum } from '../../shop-connectors/shopify/entities/enums.entity'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsPositive, IsString, Matches, Min } from 'class-validator'

export class CreateConnectionAuthDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  connectionUrl: string

  @ApiProperty({ enum: OrgType })
  @IsNotEmpty()
  @IsString()
  @IsEnum(OrgType)
  targetType: OrgType

  @ApiProperty({ enum: TargetSystemEnum })
  @IsNotEmpty()
  @IsString()
  @IsEnum(TargetSystemEnum)
  targetSystem: TargetSystemEnum

  @ApiProperty({ required: true })
  @IsNotEmptyObject()
  authObject: object

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  authStrategy: string

  @ApiProperty({ required: true })
  @IsPositive()
  implementationId: number

  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @IsPositive({ each: true })
  sharedImplementations?: number[]

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean

  @ApiProperty({ required: true })
  @IsPositive()
  targetTypeId: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  targetSystemConnectionId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  metaInfo?: any

  @ApiProperty({ required: false, example: '+HH:MM' })
  @IsOptional()
  @IsNotEmpty()
  @Matches(/(?:^[+|-](\d{2})[:](\d{2})$)|(?:[\w]+\/[\w]+)/, {
    message: 'timezone must match +HH:MM format or zone name',
  })
  defaultTimezone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Min(0)
  delayOrderReleaseInMinutes?: number
}

export class CreateShopConnectionAuthDto extends OmitType(CreateConnectionAuthDto, ['implementationId'] as const) {
  implementationId: number
}

export class CreateShopifyAppConnectionAuthDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  shopUrl: string

  implementationId: number
}

export class CreateShopifyIntregrationDto {

  @ApiProperty({ required: true, description: 'Shop domain (e.g., myshop.myshopify.com)' })
  @IsNotEmpty()
  @IsString()
  shop: string

  @ApiProperty({ required: true, description: 'Implementation ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  implementationId: number

  @ApiProperty({ required: false, description: 'Shopify app client ID' })
  @IsString()
  clientId?: string

  @ApiProperty({ required: false, description: 'Shopify app client secret' })
  @IsString()
  clientSecret?: string

  @ApiProperty({ required: false, description: 'Shopify app code' })
  @IsString()
  code?: string
}
