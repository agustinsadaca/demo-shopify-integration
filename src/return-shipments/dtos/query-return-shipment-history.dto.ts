import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator'
import { ReturnShipmentStatus } from '../../core/enums/return-shipment-status.enum'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryReturnShipmentHistoryDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  @Type(() => Number)
  returnShipmentId?: number

  @ApiProperty({ required: false, enum: ReturnShipmentStatus })
  @IsOptional()
  @IsString()
  @IsEnum(ReturnShipmentStatus)
  status?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  source?: string
}
