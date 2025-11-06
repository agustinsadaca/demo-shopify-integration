import { EntityEnum } from '../../core/types/common.types'
import { Injectable } from '@nestjs/common'
import { ShopMapperService } from '../shop-mapper.service'
import { FieldMapper } from './mappers/field-mapper.mapper'
import { InventoryItemMapper } from './mappers/inventory-item.mapper'
import { OrderItemMapper } from './mappers/order-item.mapper'
import { OrderMapper } from './mappers/order.mapper'
import { OutboundShipmentItemMapper } from './mappers/outbound-shipment-item.mapper'
import { OutboundShipmentMapper } from './mappers/outbound-shipment.mapper'
import { PartnerLocationInventoryItemMapper } from './mappers/partner-location-inventory-item.mapper'
import { RefundOrderMapper } from './mappers/refund-order.mapper'
import { ReturnShipmentItemMapper } from './mappers/return-shipment-item.mapper'
import { ReturnShipmentMapper } from './mappers/return-shipment.mapper'

@Injectable()
export class MapperService extends ShopMapperService {

  mapFrom(mapType: string, data: any): any {
    switch (mapType) {
      case EntityEnum.order:
        return OrderMapper.mapFrom(data.fulfillment, data.extraParams)
      case EntityEnum.orderItem:
        return OrderItemMapper.mapFrom(data.shopifyOrderItem, data.extraParams)
      case EntityEnum.inventoryItem:
        return InventoryItemMapper.mapFrom(data.shopifyProductVariant, data.extraParams)
      case EntityEnum.partnerLocationInventoryItem:
        return PartnerLocationInventoryItemMapper.mapFrom(data.shopifyProductVariant, data.extraParams)
      case EntityEnum.returnShipment:
        return ReturnShipmentMapper.mapFrom(data.shopifyRefund, data.extraParams)
      case EntityEnum.returnShipmentItem:
        return ReturnShipmentItemMapper.mapFrom(data.returnShipmentItem, data.extraParams)
      case EntityEnum.refundOrder:
        return RefundOrderMapper.mapFrom(data.shopifyCalculateRefundResponse, data.extraParams)
      case EntityEnum.fieldMapper:
        return FieldMapper.mapFrom(data)
      default:
        throw 'Mapping not found for Shopify Object'
    }
  }

  mapTo(mapType: string, data: any): any {
    switch (mapType) {
      case EntityEnum.order:
        return OrderMapper.mapTo(data.order)
      case EntityEnum.orderItem:
        return OrderItemMapper.mapTo(data.orderItem, data.extraParams)
      case EntityEnum.inventoryItem:
        return InventoryItemMapper.mapTo(data.inventoryItem, data.extraParams)
      case EntityEnum.outboundShipment:
        return OutboundShipmentMapper.mapTo(data.shipment, data.extraParams)
      case EntityEnum.outboundShipmentItem:
        return OutboundShipmentItemMapper.mapTo(data.shipmentItem, data.extraParams)
      case EntityEnum.inventoryLevel:
        return PartnerLocationInventoryItemMapper.mapTo(data.inventoryLevel)
      case EntityEnum.returnShipment:
        return ReturnShipmentMapper.mapTo(data.returnShipment, data.extraParams)
      case EntityEnum.returnShipmentItem:
        return ReturnShipmentItemMapper.mapTo(data.returnShipmentItem)
      case EntityEnum.refundOrder:
        return RefundOrderMapper.mapTo(data.refundOrderDto, data.extraParams)
      default:
        throw 'Mapping not found for Middleware Object'
    }
  }
}