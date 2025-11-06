import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryRefundOrderHistoryDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  refundOrderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string

}
