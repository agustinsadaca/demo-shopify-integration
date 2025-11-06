import { forwardRef, Module } from '@nestjs/common'
import { AutomationModule } from '../automation/automation.module'
import { EmailSummaryModule } from '../email-summary/email-summary.module'
import { FieldMapperModule } from '../field-mapper/field-mapper.module'
import { ImplementationsModule } from '../implementations/implementations.module'
import { InventoryItemsModule } from '../inventory-items/inventory-items.module'
import { OrdersModule } from '../orders/orders.module'
import { RefundOrdersModule } from '../refund-orders/refund-orders.module'
import { ShopConnectorsService } from './shop-connectors.service'
import { ShopifyModule } from './shopify/shopify.module'
import { AttachIsShippingMethodUnknownUtil } from './utils/attach-is-shipping-method-unkown.utils'

@Module({
  imports: [
    forwardRef(() => AutomationModule),
    ImplementationsModule,
    forwardRef(() => ShopifyModule),
    InventoryItemsModule,
    FieldMapperModule,
    RefundOrdersModule,
    EmailSummaryModule,
    OrdersModule
  ],
  providers: [ShopConnectorsService, AttachIsShippingMethodUnknownUtil],
  exports: [ShopConnectorsService]
})
export class ShopConnectorsModule {}
