import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested
} from 'class-validator'
import { MetaInfoOrderItem } from '../../core/interfaces/meta-info-order-item.interface'
import { MetaInfoOrder } from '../../core/interfaces/meta-info-order.interface'

export class PutOrderGidDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  implementationId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  customerOrderId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fulfillmentOrderId: string

  @ApiProperty()
  @IsNotEmpty()
  orderMetaInfo: MetaInfoOrder

  @ApiProperty({ isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemsGidInfo)
  orderItemsInfo: OrderItemsGidInfo[]
}

class OrderItemsGidInfo {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  customerLineItemId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fulfillmentOrderLineItemId: string

  @ApiProperty({ isArray: true })
  @IsNotEmpty()
  @IsArray()
  orderItemsMetaInfo: MetaInfoOrderItem
}
