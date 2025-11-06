import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersModule } from '../orders/orders.module'
import { FieldMapper } from './entities/field-mapper.entity'
import { FieldMapperService } from './field-mapper.service'
import { FieldMapperListener } from './listeners/field-mapper.listener'

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMapper]),
    OrdersModule
  ],
  providers: [FieldMapperService, FieldMapperListener],
  exports: [FieldMapperService, FieldMapperListener],
})
export class FieldMapperModule { }
