import { CreateReturnShipmentDto, ReturnShipment } from '../../../core/types/common.types'
import { ShopifyRefundDto } from '../dtos/shopify-refund.dto'
import { ReturnShipmentItemMapper } from './return-shipment-item.mapper'

export class ReturnShipmentMapper {
  public static mapFrom(
    shopifyReturn: ShopifyRefundDto,
    extraParams: { sku: string, returnShipmentId: number, orderId: number },
  ): CreateReturnShipmentDto {
    let returnShipmentItemList = []
    for (let item of shopifyReturn.refund_line_items) {
      let returnItemParams = {
        note: shopifyReturn.note,
        returnShipmentId: extraParams.returnShipmentId,
        sku: extraParams.sku
      }
      returnShipmentItemList.push(ReturnShipmentItemMapper.mapFrom(item, returnItemParams))
    }
    return {
      orderId: extraParams.orderId || null,
      returnShipmentItems: returnShipmentItemList,
      returnShipmentHistories: null
    }
  }

  public static mapTo(returnShipment: ReturnShipment, extraParams: { returnReason: string }): ShopifyRefundDto {
    let returnShipmentItems = returnShipment.returnShipmentItems.map(
      item => ReturnShipmentItemMapper.mapTo(item)) || []
    return {
      note: extraParams.returnReason,
      refund_line_items: returnShipmentItems,
    }
  }
}