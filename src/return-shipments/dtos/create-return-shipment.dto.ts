import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsDateString, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator'
import { ReturnShipmentHistory } from '../entities/return-shipment-history.entity'
import { ReturnShipmentItem } from '../entities/return-shipment-item.entity'
import { CreateReturnShipmentHistoryFromReturnsDto } from './create-return-shipment-history-from-returns.dto'
import { CreateReturnShipmentItemDto } from './create-return-shipment-item.dto'

export class CreateReturnShipmentDto {
  @ApiProperty()
  @IsNotEmpty() @IsPositive()
  orderId: number

  @ApiProperty({ type: CreateReturnShipmentItemDto, isArray: true })
  @IsNotEmpty()
  @ArrayNotEmpty()
  returnShipmentItems: ReturnShipmentItem[]

  @ApiProperty({ type: CreateReturnShipmentHistoryFromReturnsDto, isArray: true, required: false })
  @ValidateNested({ each: true })
  @Type(() => CreateReturnShipmentHistoryFromReturnsDto)
  @IsOptional()
  returnShipmentHistories?: ReturnShipmentHistory[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  receivedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  partnerReturnId?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  partnerReturnName?: string
}
