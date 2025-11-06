import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryOrdersHistoryDto extends PaginatorDto {
  @Type(() => Number)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  orderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ required: false })
  @IsOptional()
  source?: string
}
