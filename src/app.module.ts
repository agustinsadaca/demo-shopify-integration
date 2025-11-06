import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup'
import { randomUUID } from 'crypto'
import { LoggerModule, Params } from 'nestjs-pino'
import pino from 'pino'
import { config } from '../ormconfig'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ConfigService } from './config.service'
import { ConnectionAuthsModule } from './connection-auths/connection-auths.module'
import { CoreModule } from './core/core.module'
import { LoggerSanitizer } from './core/utils/logger-flattener.util'
import { EventHandlersModule } from './event-handlers/event-handlers.module'
import { EventTriggerModule } from './event-trigger/event-trigger.module'
import { RedisModule } from './global-modules/redis'
import { SharedQueueModule } from './queue/queue.module'
import { ShopConnectorsModule } from './shop-connectors/shop-connectors.module'
import { ShopifyModule } from './shop-connectors/shopify/shopify.module'
import { ShopModule } from './shop/shop.module'

import { APP_FILTER } from '@nestjs/core'

import PinoSentryStream from './core/utils/sentry.stream'

// sentry stream will not work in local if we use pino-pretty
const pinoLocalOptions = {
  transport: {
    target: 'pino-pretty'
  }
}
let logger = process.env.stage === 'local' ? pino(pinoLocalOptions) : pino()

let pinoHttpOptions: Params['pinoHttp'] = {}

if (process.env.stage && process.env.stage !== 'local') {
  const multistreams = pino.multistream([
    { stream: process.stdout },
    { level: 'error', stream: new PinoSentryStream() }
  ])

  logger = pino(
    {
      formatters: {
        log: LoggerSanitizer.sanitizeObject
      }
    },
    multistreams
  )

  pinoHttpOptions = {
    logger,
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err
    },
    customProps: (req) => {
      const requestCorrelationId = req.log?.bindings().requestCorrelationId || randomUUID()
      return {
        requestCorrelationId: requestCorrelationId
      }
    }
  }
} else {
  pinoHttpOptions = {
    logger,
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err
    },
    customProps: (req) => {
      const requestCorrelationId = req.log?.bindings().requestCorrelationId || randomUUID()
      return {
        requestCorrelationId: requestCorrelationId
      }
    }
  }
}

@Module({
  imports: [
    SentryModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: pinoHttpOptions
    }),
    TypeOrmModule.forRoot({ ...config, autoLoadEntities: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    HttpModule,
    ShopModule,
    AuthModule,
    ConnectionAuthsModule,
    ShopConnectorsModule,
    ShopifyModule,
    EventHandlersModule,
    EventEmitterModule.forRoot(),
    EventTriggerModule,
    ScheduleModule.forRoot(),
    RedisModule.forRoot(ConfigService.redisConfig()),
    BullModule.forRoot(ConfigService.bullQueueConfig()),
    SharedQueueModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter
    }
  ]
})
export class AppModule {}
