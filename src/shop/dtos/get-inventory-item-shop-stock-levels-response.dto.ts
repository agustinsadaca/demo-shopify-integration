import { ApiProperty } from '@nestjs/swagger'
import { ShopifyInventoryStates } from '../../shop-connectors/shopify/enums/shopify-inventory-states-enum'

class GetInventoryItemShopStockLevelsResponseDto {
  @ApiProperty({ required: false })
  on_hand?: number

  @ApiProperty({ required: false })
  available?: number

  @ApiProperty({ required: false })
  committed?: number

  @ApiProperty({ required: false })
  incoming?: number

  @ApiProperty({ required: false })
  damaged?: number

  @ApiProperty({ required: false })
  quality_control?: number

  @ApiProperty({ required: false })
  reserved?: number

  @ApiProperty({ required: false })
  safety_stock?: number

  @ApiProperty({ required: false })
  stockCurrent?: number

  @ApiProperty({ required: false })
  stockQuantity?: number

  @ApiProperty({ required: false })
  stock?: number
}

export interface IGetInventoryItemShopifyStockLevelsResponse
  extends Record<ShopifyInventoryStates, number> {}

export default GetInventoryItemShopStockLevelsResponseDto
