import { EntityEnum } from '../../../core/types/common.types'
import { CreateFieldMapperDto } from '../../../field-mapper/dto/create-field-mapper.dto'
import { ShopServiceMapperFields } from '../../shop-connectors.service'

export class FieldMapper {
  public static mapFrom({ shippingMethodName }): CreateFieldMapperDto {
    const fieldMapperDto = new CreateFieldMapperDto()
    fieldMapperDto.entityField = ShopServiceMapperFields.shippingMethod
    fieldMapperDto.entityType = EntityEnum.order
    fieldMapperDto.shopValue = shippingMethodName
    fieldMapperDto.name = `${shippingMethodName} (Shopify)`
    return fieldMapperDto
  }
}