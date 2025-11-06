import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'
import { MetaInfoImplementation } from '../../core/interfaces/meta-info-implementation.interface'

export class UpdateImplementationDto {
  @ApiProperty({ required: false })
  @IsPositive() @IsOptional()
  customerId?: number

  @ApiProperty({ required: false })
  @IsPositive() @IsOptional()
  partnerId?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  shopName?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  wmsName?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  implementationIdCustomer?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  implementationIdPartner?: string

  @ApiProperty({ required: false })
  @IsPositive() @IsOptional()
  partnerLocationId?: number

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  customerLocationId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  metaInfo?: MetaInfoImplementation
}
