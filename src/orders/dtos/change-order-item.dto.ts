import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator'

export class ChangeOrderItemDto {
  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  id: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number
}