export class ShopifyProductImageDto {
  id: number
  product_id: number
  src: string
  variant_ids: Array<number>
}

export class ShopifyProductImageGraphQlDto {
  preview: {
    image: {
      url: string
    }
  }
}

export class ShopifyProductVariantImageGraphQlDto {
  id: string
  url: string
}
