import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { OrderHistoryTag } from '../../core/interfaces/order-history-tag.interface'

export class CreateOrdersHistoryFromOrderDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  status: string

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
  @ValidateNested({ each: true })
  @Type(() => OrderHistoryTag)
  tags?: OrderHistoryTag[]

  @IsOptional() @IsBoolean()
  isInternalHistory?: boolean
}
