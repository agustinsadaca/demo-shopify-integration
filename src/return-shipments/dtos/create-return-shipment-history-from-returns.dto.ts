import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ReturnShipmentStatus } from '../../core/enums/return-shipment-status.enum'

export class CreateReturnShipmentHistoryFromReturnsDto {

  @ApiProperty({ enum: ReturnShipmentStatus })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ReturnShipmentStatus)
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
