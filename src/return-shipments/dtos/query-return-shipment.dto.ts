import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryReturnShipmentDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  @Type(() => Number)
  orderId?: number

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

  @ApiProperty({
    description: 'write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  receivedAt?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  partnerReturnId?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  partnerReturnName?: string
}
