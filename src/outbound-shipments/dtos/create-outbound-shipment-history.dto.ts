import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'
import { OutboundShipmentStatus } from '../../core/enums/outbound-shipment-status.enum'

export class CreateOutboundShipmentHistoryDto {
  @ApiProperty({ required: true })
  @IsPositive()
  @IsNotEmpty()
  outboundShipmentId: number

  @ApiProperty({ required: true, enum: OutboundShipmentStatus })
  @IsNotEmpty()
  @IsEnum(OutboundShipmentStatus)
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
}
