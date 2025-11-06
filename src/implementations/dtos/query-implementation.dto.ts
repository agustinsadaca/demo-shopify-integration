import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'
import { transformMultipleQueryIds } from '../../core/utils/transform-multiple-ids-query.util'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryImplementationDto extends PaginatorDto {
  @ApiProperty({ required: false, isArray: true, nullable: false })
  @Transform(({ value }) => {
    return transformMultipleQueryIds(value)
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ message: "implementation ids should not be empty", })
  ids?: number[]

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  customerId?: number

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  partnerId?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopName?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  wmsName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  implementationIdCustomer?: string

  @ApiProperty({ required: false })
  @IsOptional()
  implementationIdPartner?: string

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  partnerLocationId?: number

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  customerLocationId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean
}