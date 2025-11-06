import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator'

class ShopifyAuthDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  accessKey: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  secretKey: string
}

export class ShopifyCredentialDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  tenantLocationName?: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  connectionUrl: string

  @ApiProperty({ required: true })
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ShopifyAuthDto)
  authObject: ShopifyAuthDto
}
