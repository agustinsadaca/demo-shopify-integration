import { Module } from '@nestjs/common'
import { BrandLabelModule } from '../brand-label/brand-label.module'
import { CoreModule } from '../core/core.module'
import { ImplementationsService } from './implementations.service'

@Module({
  imports: [CoreModule, BrandLabelModule],
  providers: [ImplementationsService],
  exports: [ImplementationsService]
})
export class ImplementationsModule {}
