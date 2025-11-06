import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class LotNumberQuantity {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lotNumber: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  quantity: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expirationDate?: Date
}