export class ShopDto {
  plan_display_name: string
  plan_name: string
}

export class ShopGraphQLDto {
  orderNumberFormatPrefix: string
  orderNumberFormatSuffix: string
  plan: {
    displayName: string
    shopifyPlus: boolean
  }
}
