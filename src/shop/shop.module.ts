import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConnectionAuthsModule } from '../connection-auths/connection-auths.module'
import { CoreModule } from '../core/core.module'
import { EventTriggerModule } from '../event-trigger/event-trigger.module'
import { FieldMapper } from '../field-mapper/entities/field-mapper.entity'
import { FieldMapperService } from '../field-mapper/field-mapper.service'
import { ImplementationsModule } from '../implementations/implementations.module'
import { InventoryBundlesModule } from '../inventory-bundles/inventory-bundles.module'
import { InventoryItemsModule } from '../inventory-items/inventory-items.module'
import { InventoryLevelSourceModule } from '../inventory-level-source/inventory-level-source.module'
import { OrdersModule } from '../orders/orders.module'
import { OutboundShipmentsModule } from '../outbound-shipments/outbound-shipments.module'
import { RefundOrdersModule } from '../refund-orders/refund-orders.module'
import { ReturnShipmentsModule } from '../return-shipments/return-shipments.module'
import { ShopConnectorsModule } from '../shop-connectors/shop-connectors.module'
import { ShopifyModule } from '../shop-connectors/shopify/shopify.module'
import { ShopController } from './shop.controller'
import { ShopService } from './shop.service'

@Module({
  imports: [
    CoreModule,
    ImplementationsModule,
    OrdersModule,
    OutboundShipmentsModule,
    ReturnShipmentsModule,
    InventoryItemsModule,
    EventTriggerModule,
    InventoryLevelSourceModule,
    ConnectionAuthsModule,
    TypeOrmModule.forFeature([FieldMapper]),
    InventoryBundlesModule,
    RefundOrdersModule,
    ShopConnectorsModule,
    ShopifyModule,
  ],
  controllers: [ShopController],
  providers: [
    ShopService,
    FieldMapperService
  ]
})
export class ShopModule {}
