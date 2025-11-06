import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'
import { MetaInfoImplementation } from '../../core/interfaces/meta-info-implementation.interface'

export class CreateImplementationDto {
  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  customerId: number

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  partnerId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  shopName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  wmsName: string

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  implementationIdCustomer?: string

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  implementationIdPartner?: string

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  partnerLocationId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  customerLocationId: string

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  metaInfo?: MetaInfoImplementation
}