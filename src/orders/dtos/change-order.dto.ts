import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsByteLength,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  ValidateNested
} from 'class-validator'
import { MetaInfoOrder } from '../../core/interfaces/meta-info-order.interface'
import { ChangeOrderItemDto } from './change-order-item.dto'

export class ChangeOrderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingFirstName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingLastName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingAddressLine1?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingAddressLine2?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingCompanyName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  shippingEmail?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingZip?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingCity?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingRegion?: string

  @ApiProperty({
    description: 'Country ISO Alpha-2 code (Uppercase)',
    minimum: 2,
    maximum: 2,
    required: false
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsUppercase()
  @IsByteLength(2, 2)
  shippingCountryCodeIso?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingPhone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  shippingMethod?: string

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRefundRequired?: boolean

  @ApiProperty({ type: () => [ChangeOrderItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ChangeOrderItemDto)
  orderItems?: ChangeOrderItemDto[]

  @ApiProperty({ required: false })
  @IsOptional()
  metaInfo?: MetaInfoOrder
}
