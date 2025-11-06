import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConnectionAuthsModule } from '../../connection-auths/connection-auths.module'
import { ConnectionAuth } from '../../connection-auths/entities/connection-auth.entity'
import { CoreModule } from '../../core/core.module'
import { TargetSync } from '../../core/entities/target-sync.entity'
import { EventTriggerModule } from '../../event-trigger/event-trigger.module'
import { FieldMapperModule } from '../../field-mapper/field-mapper.module'
import { ImplementationsModule } from '../../implementations/implementations.module'
import { InventoryBundlesService } from '../../inventory-bundles/inventory-bundles.service'
import { InventoryItemsModule } from '../../inventory-items/inventory-items.module'
import { InventoryLevelSourceService } from '../../inventory-level-source/inventory-level-source.service'
import { NotificationsModule } from '../../notifications/notifications.module'
import { OrdersModule } from '../../orders/orders.module'
import { OutboundShipmentsModule } from '../../outbound-shipments/outbound-shipments.module'
import { RefundOrdersModule } from '../../refund-orders/refund-orders.module'
import { ReturnShipmentsModule } from '../../return-shipments/return-shipments.module'
import { ShippingMethodUtilModule } from '../../shipping-method-util/shipping-method-util.module'
import { OrdersUtil } from '../utils/orders.util'
import { RateLimitUtil } from '../utils/rate-limit.util'
import { GraphQLShopifyService } from './graphql-shopify.service'
import { HttpShopifyService } from './http-shopify.service'
import { ShopifyListener } from './listeners/shopify.listeners'
import { MapperService } from './mapper.service'
import { GraphQLMapperService } from './shopify-graphql-mapper.service'
import { ShopifyService } from './shopify.service'

@Module({
  imports: [
    forwardRef(() => ConnectionAuthsModule),
    HttpModule.register({}),
    CoreModule,
    TypeOrmModule.forFeature([TargetSync, ConnectionAuth]),
    FieldMapperModule,
    OutboundShipmentsModule,
    ImplementationsModule,
    OrdersModule,
    InventoryItemsModule,
    forwardRef(() => EventTriggerModule),
    RefundOrdersModule,
    ReturnShipmentsModule,
    NotificationsModule,
    ShippingMethodUtilModule
  ],
  providers: [
    ShopifyService,
    HttpShopifyService,
    InventoryBundlesService,
    InventoryLevelSourceService,
    MapperService,
    OrdersUtil,
    RateLimitUtil,
    ShopifyListener,
    GraphQLShopifyService,
    GraphQLMapperService
  ],
  exports: [ShopifyService, HttpShopifyService, GraphQLShopifyService]
})
export class ShopifyModule {}
