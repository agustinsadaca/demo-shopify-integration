import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsOptional, IsPositive, IsString } from 'class-validator'
import { ReturnShipmentStatus } from '../../core/enums/return-shipment-status.enum'

export class UpdateReturnShipmentHistoryDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  returnShipmentId?: number

  @ApiProperty({ required: false, enum: ReturnShipmentStatus })
  @IsOptional()
  @IsString()
  @IsEnum(ReturnShipmentStatus)
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
}
