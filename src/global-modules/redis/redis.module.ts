
import { DynamicModule, Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import * as redis from 'redis'
import { ConfigService } from '../../config.service'
import { RedisModuleOptions } from './interfaces/redis-module-options.interface'
import { REDIS_IO_CLIENT, REDIS_MODULE_OPTIONS } from './redis.constants'

@Global()
@Module({})
export class RedisModule implements OnApplicationShutdown {
  private static logger = new Logger(RedisModule.name)

  constructor(private readonly moduleRef: ModuleRef) { }

  async onApplicationShutdown(): Promise<void> {
    const redisClient: redis.RedisClientType = this.moduleRef.get(REDIS_IO_CLIENT)

    try {
      if (redisClient !== null || redisClient !== undefined) {
        await redisClient?.destroy()
      }
    } catch (e) {
      RedisModule.logger.error(e?.message, e?.stack)
    }
  }

  static forRoot(options: RedisModuleOptions): DynamicModule {
    const defaultClientProvider = this.createClientProvider(options)
    const redisModuleOptions = this.createModuleOptions(options)

    return {
      module: RedisModule,
      providers: [
        redisModuleOptions,
        defaultClientProvider
      ],
      exports: [
        defaultClientProvider,
      ],
    }
  }

  private static createClientProvider(options: RedisModuleOptions) {
    return {
      provide: REDIS_IO_CLIENT,
      useFactory: async () => await this.createClientFactory(options),
    }
  }

  private static async createClientFactory(options: RedisModuleOptions): Promise<any> {
    try {
      const isOptionsValid = Object.keys(options)?.length > 0
      const isTestEnv = process.env.NODE_ENV === 'test'

      const client = redis.createClient(options)

      if (!ConfigService.isRedisEnabled()) {
        return client
      }

      if (isOptionsValid && !isTestEnv) {
        await client.connect()
      }

      client.on('error', (e) => RedisModule.logger.error(e?.message))

      return client
    } catch (e) {
      console.error(e)
      RedisModule.logger.error(`RedisModule:createClientFactory:> ` + e?.message, e?.stack)
      throw e
    }
  }

  private static createModuleOptions(options: RedisModuleOptions) {
    return {
      provide: REDIS_MODULE_OPTIONS,
      useValue: options
    }
  }
}