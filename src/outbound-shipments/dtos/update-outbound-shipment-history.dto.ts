import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsPositive } from 'class-validator'
import { CreateOutboundShipmentHistoryDto } from './create-outbound-shipment-history.dto'
import { OutboundShipmentStatus } from '../../core/enums/outbound-shipment-status.enum'

export class UpdateOutboundShipmentHistoryDto extends PartialType(CreateOutboundShipmentHistoryDto) {
  @ApiProperty({ required: false })
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  outboundShipmentId?: number

  @ApiProperty({ required: false, enum: OutboundShipmentStatus })
  @IsNotEmpty()
  @IsOptional()
  @IsEnum(OutboundShipmentStatus)
  status?: string

  @ApiProperty({ required: false })
  @IsOptional()
  source?: string

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
}
