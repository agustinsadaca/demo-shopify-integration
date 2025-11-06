import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryReturnShipmentItemDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  @Type(() => Number)
  returnShipmentId?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  inventoryItemSku?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  @Type(() => Number)
  returnedQuantity?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  @Type(() => Number)
  restockableQuantity?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  returnReason?: string

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

  @ApiProperty({ isArray: true, required: false })
  @IsOptional()
  @IsString({ each: true })
  serialNumber?: string[]
}