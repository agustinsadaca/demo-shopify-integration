import { CreatePartnerLocationInventoryItemDto } from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { ShopifyInventoryLevelDto } from '../dtos/shopify-inventory-level.dto'
import { ShopifyProductVariantGraphQlDto } from '../dtos/shopify-product-variant.dto'
import { GraphQlIdConverter } from './graphql-id-converter.mapper'

export class PartnerLocationInventoryItemMapper {
  public static mapFrom(
    shopifyProductVariant: ShopifyProductVariantGraphQlDto,
    extraParams?: any
  ): CreatePartnerLocationInventoryItemDto {
    if (!shopifyProductVariant.sku) {
      Logger.error('omitting partnerLocationInventoryItem with no sku: ', shopifyProductVariant)
      return null
    }

    return {
      partnerLocationId: extraParams.partnerLocationId,
      implementationId: extraParams.implementationId,
      inventoryItemSku: shopifyProductVariant.sku,
      quantityAvailable: 0,
      shopSyncedAt: new Date(),
      metaInfo: {
        shopify_inventory_item_id: String(
          GraphQlIdConverter.convertFromGraphqlId(shopifyProductVariant.inventoryItem.id)
        )
      }
    }
  }

  public static mapTo(inventoryLevel: {
    id: number
    sellableQuantity: number
    locationId: number
  }): ShopifyInventoryLevelDto {
    return {
      available: inventoryLevel.sellableQuantity,
      inventory_item_id: Number(inventoryLevel.id),
      location_id: inventoryLevel.locationId
    }
  }
}
