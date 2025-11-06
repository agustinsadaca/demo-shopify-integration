import { EntityEnum } from '../../core/types/common.types'
import { Injectable } from '@nestjs/common'
import { ShopMapperService } from '../shop-mapper.service'
import { InventoryItemMapper } from './graphql-mappers/inventory-item.mapper'
import { OrderMapper } from './graphql-mappers/order.mapper'
import { OutboundShipmentMapper } from './graphql-mappers/outbound-shipment.mapper'
import { PartnerLocationInventoryItemMapper } from './graphql-mappers/partner-location-inventory-item.mapper'
import { RefundOrderMapper } from './graphql-mappers/refund-order.mapper'

@Injectable()
export class GraphQLMapperService extends ShopMapperService {
  mapFrom(mapType: EntityEnum, data: any): any {
    switch (mapType) {
      case EntityEnum.inventoryItem:
        return InventoryItemMapper.mapFrom(data.shopifyProductVariant, data.extraParams)
      case EntityEnum.partnerLocationInventoryItem:
        return PartnerLocationInventoryItemMapper.mapFrom(
          data.shopifyProductVariant,
          data.extraParams
        )
      case EntityEnum.refundOrder:
        return RefundOrderMapper.mapFrom(data.shopifyCalculateRefundResponse, data.extraParams)
      case EntityEnum.order:
        return OrderMapper.mapFrom(data.fulfillment, data.extraParams)
      default:
        throw 'Mapping not found for Shopify Object'
    }
  }

  mapTo(mapType: EntityEnum, data: any): any {
    switch (mapType) {
      case EntityEnum.inventoryLevel:
        return PartnerLocationInventoryItemMapper.mapTo(data.inventoryLevel)
      case EntityEnum.refundOrder:
        return RefundOrderMapper.mapTo(data.refundOrderDto, data.extraParams)
      case EntityEnum.outboundShipment:
        return OutboundShipmentMapper.mapTo(data.shipment, data.extraParams)
      default:
        throw 'Mapping not found for Middleware Object'
    }
  }
}
