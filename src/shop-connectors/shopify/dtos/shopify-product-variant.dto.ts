import { ShopifyInventoryItemGraphQLDto } from './shopify-inventory-item.dto'
import { ShopifyProductVariantImageGraphQlDto } from './shopify-product-image.dto'
import { ShopifyProductGraphQlDto } from './shopify-product.dto'

export class ShopifyProductVariantDto {
  id: number
  sku: string
  product_id: number
  title: string
  inventory_quantity: number
  inventory_item_id: number
  weight: number
  weight_unit: string
  price: string
  barcode: string
  inventory_item_obj?: any
  image_id?: number
}

export class ShopifyProductVariantGraphQlDto {
  id: string
  legacyResourceId: string
  sku: string
  product: ShopifyProductGraphQlDto
  title: string
  inventoryQuantity: number
  inventoryItem: ShopifyInventoryItemGraphQLDto
  price: string
  barcode: string
  inventory_item_obj?: any
  image: ShopifyProductVariantImageGraphQlDto
  updatedAt: string
}

export class ShopifyProductVariantMetaInfoGraphQlDto {
  id: string
  legacyResourceId: string
  inventoryItem: { id: string; legacyResourceId: string }
}
