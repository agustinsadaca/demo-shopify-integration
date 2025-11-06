import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module'
import { InventoryItemsService } from './inventory-items.service'

@Module({
  imports: [CoreModule],
  providers: [InventoryItemsService],
  exports: [InventoryItemsService]
})
export class InventoryItemsModule { }
