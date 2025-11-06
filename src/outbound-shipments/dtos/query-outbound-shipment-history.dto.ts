import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsPositive } from 'class-validator'
import { OutboundShipmentStatus } from '../../core/enums/outbound-shipment-status.enum'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryOutboundShipmentHistoryDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  outboundShipmentId?: number

  @ApiProperty({ required: false, enum: OutboundShipmentStatus })
  @IsOptional()
  @IsEnum(OutboundShipmentStatus)
  status?: string

  @ApiProperty({ required: false })
  @IsOptional()
  source?: string
}
