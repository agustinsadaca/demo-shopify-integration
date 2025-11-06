import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsPositive, IsString } from 'class-validator'

export class UpdateReturnShipmentDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  orderId?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  partnerReturnId?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  partnerReturnName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  receivedAt?: Date
}

