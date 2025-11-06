import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDateString, IsOptional, IsPositive, IsString } from 'class-validator'
import { OrderHistoryTag } from '../../core/interfaces/order-history-tag.interface'

export class UpdateOrdersHistoryDto {
  @Type(() => Number)
  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  orderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  wmsCreatedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  wmsUpdatedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  shopCreatedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  shopUpdatedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  source?: string

  @ApiProperty({ type: () => [OrderHistoryTag], required: false })
  @IsOptional()
  tags?: OrderHistoryTag[]

  @IsOptional() @IsBoolean()
  isInternalHistory?: boolean
}
