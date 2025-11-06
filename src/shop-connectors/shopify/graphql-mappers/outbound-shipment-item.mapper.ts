import { OutboundShipmentItem } from '../../../core/types/common.types'
import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyResources } from '../../../core/types/common.types'
import { ShopifyShipmentItemGraphQLDto } from '../dtos/shopify-shipment-item.dto'

export class OutboundShipmentItemMapper {
  public static mapTo(
    outboundShipmentItem: OutboundShipmentItem,
    params: { customerShipmentItemGId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrderLineItem> }
  ): ShopifyShipmentItemGraphQLDto {
    return {
      id: params.customerShipmentItemGId,
      quantity: outboundShipmentItem.quantity
    }
  }
}
