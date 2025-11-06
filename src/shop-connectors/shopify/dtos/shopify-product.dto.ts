import { ShopifyProductImageDto, ShopifyProductImageGraphQlDto } from './shopify-product-image.dto'
import { ShopifyProductVariantDto } from './shopify-product-variant.dto'

export class ShopifyProductDto {
  id: number
  sku: string
  title: string
  variants: ShopifyProductVariantDto[]
  images?: ShopifyProductImageDto[]
  image?: ShopifyProductImageDto
}

export class ShopifyProductGraphQlDto {
  id: string
  title: string
  descriptionHtml: string
  featuredMedia: ShopifyProductImageGraphQlDto
}
