import { CreateInventoryItemDto, TargetSystemEnum } from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { sanitizedHSC } from '../../utils/inventory-item.util'
import { ShopifyProductVariantImageGraphQlDto } from '../dtos/shopify-product-image.dto'
import { ShopifyProductVariantGraphQlDto } from '../dtos/shopify-product-variant.dto'
import { DimensionMapper } from './dimension.mapper'

export class InventoryItemMapper {
  public static mapFrom(
    shopifyProductVariant: ShopifyProductVariantGraphQlDto,
    extraParams?: any
  ): CreateInventoryItemDto {
    if (!shopifyProductVariant.sku) {
      Logger.error('omitting inventoryItem with no sku: ', shopifyProductVariant)
      return null
    }
    const harmonizedSystemCode: string = sanitizedHSC(
      shopifyProductVariant?.inventory_item_obj?.harmonized_system_code
    )
    !harmonizedSystemCode &&
      Logger.warn(
        `Invalid harmonizedSystemCode for sku: ${shopifyProductVariant.sku} - HSC: ${shopifyProductVariant?.inventory_item_obj?.harmonized_system_code}`
      )

    return {
      sku: shopifyProductVariant.sku,
      implementationId: extraParams.implementationId,
      customerItemId: shopifyProductVariant.legacyResourceId,
      partnerItemId: null,
      dimensions: DimensionMapper.mapFrom(shopifyProductVariant),
      name:
        shopifyProductVariant.title === 'Default Title'
          ? extraParams.productTitle
          : `${extraParams.productTitle} - ${shopifyProductVariant.title}`,
      source: TargetSystemEnum.SHOPIFY,
      price: Number(shopifyProductVariant.price),
      barcode: shopifyProductVariant.barcode,
      shopSyncedAt: new Date(),
      countryCodeOfOrigin:
        shopifyProductVariant.inventory_item_obj &&
        shopifyProductVariant.inventory_item_obj.country_code_of_origin
          ? shopifyProductVariant.inventory_item_obj.country_code_of_origin
          : null,
      harmonizedSystemCode: harmonizedSystemCode,
      metaInfo: {
        shopify_inventory_item_id: shopifyProductVariant.inventoryItem.legacyResourceId,
        shopify_inventory_item_gid: shopifyProductVariant.inventoryItem.id,
        shopify_product_variant_gid: shopifyProductVariant.id
      },
      imagesUrl: extraParams.images?.map((image: ShopifyProductVariantImageGraphQlDto) => ({
        url: image?.url
      })),
      updatedAt: shopifyProductVariant.updatedAt
    } as CreateInventoryItemDto
  }
}
