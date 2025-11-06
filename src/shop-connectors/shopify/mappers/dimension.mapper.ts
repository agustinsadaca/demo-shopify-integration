import { Dimension } from '../../../core/types/common.types'
import { ShopifyProductVariantGraphQlDto } from '../dtos/shopify-product-variant.dto'

export class DimensionMapper {
  private static weightUnitMapper(value: string) {
    const lowerCaseValue = value.toLowerCase()
    switch (lowerCaseValue) {
      case 'grams':
        return 'g'
      case 'kilograms':
        return 'kg'
      case 'ounces':
        return 'oz'
      case 'pounds':
        return 'lb'
      default:
        return lowerCaseValue
    }
  }

  public static mapFrom(shopifyProductVariant: ShopifyProductVariantGraphQlDto): Dimension {
    return {
      weight: shopifyProductVariant.inventoryItem?.measurement?.weight?.value,
      weightUnit: this.weightUnitMapper(
        shopifyProductVariant.inventoryItem?.measurement?.weight?.unit
      )
    }
  }

  public static mapTo(dimension: Dimension): { weight: number; weight_unit: string } {
    return {
      weight: dimension.weight,
      weight_unit: dimension.weightUnit
    }
  }
}
