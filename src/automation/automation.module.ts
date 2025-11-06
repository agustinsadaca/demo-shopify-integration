import { Module } from '@nestjs/common'
import { AutomationEngineService } from './automation-engine.service'

@Module({
  providers: [AutomationEngineService],
  exports: [AutomationEngineService]
})
export class AutomationModule {}
