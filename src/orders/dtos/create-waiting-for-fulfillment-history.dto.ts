import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class CreateWaitingForFulfillmentHistoryDto {
  @ApiProperty()
  @IsNumber()
  id: number

  @ApiProperty()
  @IsString()
  currentStatus: string

  @ApiProperty()
  @IsString()
  partnerOrderId: string

  @ApiProperty()
  @IsNumber()
  implementationId: number
}
