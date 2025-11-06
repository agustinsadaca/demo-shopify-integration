import { CreatePartnerLocationInventoryItemDto } from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { ShopifyProductVariantGraphQlDto } from '../dtos/shopify-product-variant.dto'

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
        shopify_inventory_item_id: shopifyProductVariant.inventoryItem.legacyResourceId,
        shopify_inventory_item_gid: shopifyProductVariant.inventoryItem.id
      }
    }
  }

  public static mapTo(inventoryLevel: {
    id: string
    sellableQuantity: number
    locationId: string
  }) {
    return {
      quantity: inventoryLevel.sellableQuantity,
      inventoryItemId: inventoryLevel.id,
      locationId: inventoryLevel.locationId
    }
  }
}
