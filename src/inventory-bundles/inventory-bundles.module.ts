import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module'
import { InventoryBundlesService } from './inventory-bundles.service'

@Module({
  imports: [CoreModule],
  providers: [InventoryBundlesService],
  exports: [InventoryBundlesService]
})
export class InventoryBundlesModule { }
