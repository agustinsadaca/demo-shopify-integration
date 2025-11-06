import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsPositive, Max, Min } from 'class-validator'
import { OutboundShipmentStatus } from '../../core/enums/outbound-shipment-status.enum'

export class QueryShipmentsForTrackingDto {
  @ApiProperty({ enum: OutboundShipmentStatus, required: true })
  @IsEnum(OutboundShipmentStatus)
  currentStatus: OutboundShipmentStatus

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  afterTimeInMilliSecs?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  carrier?: string

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  lastOutboundShipmentId?: number

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  @Max(+(process.env.MAX_PAGE_LIMIT || 100))
  @Min(+(process.env.MIN_PAGE_LIMIT || 10))
  limit?: number = +(process.env.DEFAULT_PAGE_LIMIT || 10)
}