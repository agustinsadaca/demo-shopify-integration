import {
  CreateInventoryItemDto,
  InventoryItem,
  TargetSystemEnum
} from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { sanitizedHSC } from '../../utils/inventory-item.util'
import { ShopifyInventoryItemDto } from '../dtos/shopify-inventory-item.dto'
import { ShopifyProductVariantImageGraphQlDto } from '../dtos/shopify-product-image.dto'
import { ShopifyProductVariantGraphQlDto } from '../dtos/shopify-product-variant.dto'
import { DimensionMapper } from './dimension.mapper'
import { GraphQlIdConverter } from './graphql-id-converter.mapper'

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
      customerItemId: String(GraphQlIdConverter.convertFromGraphqlId(shopifyProductVariant.id)),
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
        shopify_inventory_item_id: String(
          GraphQlIdConverter.convertFromGraphqlId(shopifyProductVariant.inventoryItem.id)
        )
      },
      imagesUrl: extraParams.images?.map((image: ShopifyProductVariantImageGraphQlDto) => ({
        url: image?.url
      })),
      updatedAt: shopifyProductVariant.updatedAt
    } as CreateInventoryItemDto
  }

  public static mapTo(
    inventoryItem: InventoryItem,
    extraParams: { updatedAt: string }
  ): ShopifyInventoryItemDto {
    return {
      id: Number(inventoryItem.customerItemId),
      sku: inventoryItem.sku,
      updated_at: extraParams.updatedAt,
      country_code_of_origin: inventoryItem.countryCodeOfOrigin,
      harmonized_system_code: inventoryItem.harmonizedSystemCode
    }
  }
}
