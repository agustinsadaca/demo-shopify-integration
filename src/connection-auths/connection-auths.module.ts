import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ShopifyModule } from '../shop-connectors/shopify/shopify.module'
import { ConnectionAuthsController } from './connection-auths.controller'
import { ConnectionAuthsService } from './connection-auths.service'
import { ConnectionAuth } from './entities/connection-auth.entity'
import { Encryption } from './utils/encryption-util'

@Module({
  imports: [
    forwardRef(() => ShopifyModule),
    TypeOrmModule.forFeature([ConnectionAuth])
  ],
  controllers: [ConnectionAuthsController],
  providers: [ConnectionAuthsService, Encryption],
  exports: [ConnectionAuthsService]
})
export class ConnectionAuthsModule { }
