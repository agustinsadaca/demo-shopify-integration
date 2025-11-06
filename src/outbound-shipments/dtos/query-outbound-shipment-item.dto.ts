import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString, Min } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryOutboundShipmentItemDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  outboundShipmentId?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderItemSku?: string

  @ApiProperty({ required: false })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantity?: number

  @ApiProperty({
    description: 'write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  createdAt?: string

  @ApiProperty({
    description: 'write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  updatedAt?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  belongsToBundle?: boolean

  @ApiProperty({ isArray: true, required: false })
  @IsOptional()
  @IsString({ each: true })
  lotNumber?: string[]

  @ApiProperty({ isArray: true, required: false })
  @IsOptional()
  @IsString({ each: true })
  serialNumber?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isShipsWithItem?: boolean
}
