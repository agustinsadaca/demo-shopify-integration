import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module'
import { InventoryLevelSourceService } from './inventory-level-source.service'

@Module({
  imports: [CoreModule],
  providers: [InventoryLevelSourceService],
  exports: [InventoryLevelSourceService]
})
export class InventoryLevelSourceModule { }
