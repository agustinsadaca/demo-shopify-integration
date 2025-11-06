import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator'

export class FulfillmentCheckRequestDto {
  @ApiProperty({ type: Number, required: true, isArray: true })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  orderIds: number[]
}

class FulfillmentCheckToBeFixedProperties {
  @ApiProperty({ type: Number })
  orderId: number

  @ApiProperty({ isArray: true })
  tags: Array<any>

  @ApiProperty()
  isPreviousAndNewTagSame: boolean
}

export class FulfillmentCheckResponseDto {
  @ApiProperty({ type: Number, isArray: true })
  readyForFulfillment: Array<number>

  @ApiProperty({ type: FulfillmentCheckToBeFixedProperties, isArray: true })
  toBeFixed: Array<FulfillmentCheckToBeFixedProperties>
}