import { InventoryItem } from '../../../core/types/common.types'
import { ShopifyProductVariantDto } from '../dtos/shopify-product-variant.dto'
import { ShopifyProductDto } from '../dtos/shopify-product.dto'

export class ProductMapper {
  public static mapTo(inventoryItem: InventoryItem, shopifyProductVariant: ShopifyProductVariantDto): ShopifyProductDto {
    return {
      id: Number(inventoryItem.customerItemId),
      sku: inventoryItem.sku,
      title: inventoryItem.name,
      variants: [shopifyProductVariant]
    }
  }
}