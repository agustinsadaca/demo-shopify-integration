import { Inject, Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { lock } from 'simple-redis-mutex'
import { mainConfigs } from '../../config/config'
import { ConnectionAuth } from '../../connection-auths/entities/connection-auth.entity'
import { RateLimitConfig } from '../../core/interfaces/rate-limit-config.enum'
import { REDIS_IO_CLIENT, RedisClient } from '../../global-modules/redis'
import { shopifyGraphQLPlanRateLimitConfig } from '../shopify/shopify.config'
interface IShopifyGraphQLRateLimitConfig {
  maximumAvailable: number
  restoreRate: number
  currentlyAvailable: number
}

@Injectable()
export class RateLimitUtil {
  private readonly logger = new Logger(RateLimitUtil.name)

  constructor(@Inject(REDIS_IO_CLIENT) private readonly redisClient: RedisClient) {}

  async trackRateLimit(connection: ConnectionAuth) {
    try {
      const date = new Date()
      const yearMonthDay = `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`

      const key = `shopify-demo-rate-limit-info:${connection.targetSystem}:${connection.implementationId}:${yearMonthDay}`
      await this.redisClient.incr(key)

      const currentTime = new Date().getTime()

      const endOfDay = new Date()
      endOfDay.setHours(48, 59, 59, 999)

      // Calculate the time difference in seconds
      const timeDifferenceInSeconds = Math.floor((endOfDay.getTime() - currentTime) / 1000)
      await this.redisClient.expire(key, timeDifferenceInSeconds)
    } catch (error) {
      this.logger.error(error, error?.stack)
    }
  }

  getRateLimit(
    targetSystem: string,
    connection: ConnectionAuth
  ): RateLimitConfig {
    if (targetSystem?.toLowerCase() === 'dhl') {
      return {
        allowedRequest: 1,
        ttlInSeconds: mainConfigs.rateLimit.dhl.ttlInSeconds
      }
    }

    const metaInfoShopifyPlan: RateLimitConfig | undefined =
      connection.metaInfo?.['shopifyPlan']?.rateLimit

    if (
      metaInfoShopifyPlan &&
      metaInfoShopifyPlan.allowedRequest &&
      metaInfoShopifyPlan.ttlInSeconds
    ) {
      return metaInfoShopifyPlan
    }

    return mainConfigs.rateLimit.default
  }

  async handleRateLimit(connection: ConnectionAuth ): Promise<void> {
    try {
      const implementationId = connection.implementationId
      const { targetSystem } = connection

      let { ttlInSeconds, allowedRequest } = this.getRateLimit(targetSystem, connection)

      const ttlInMilliSeconds = ttlInSeconds * 1000

      const key = `rateLimit:${targetSystem}:${implementationId}`

      const count = (await this.redisClient.incr(key)) as number

      await this.redisClient.pExpire(key, ttlInMilliSeconds)

      const sleepTime = (ttlInMilliSeconds / allowedRequest) * count + 10

      this.logger.log(`handleRateLimit: sleeping ${key} for ${sleepTime} milliseconds`)

      this.trackRateLimit(connection)
      return await new Promise((resolve) => setTimeout(resolve, sleepTime))
    } catch (error) {
      throw error
    }
  }

  getRedisKeyForShopifyGraphQLRequest(implementationId: number) {
    return `graphql-rate-limit:${implementationId}:${randomUUID()}`
  }

  async setShopifyGraphQLConfigToRedis(
    implementationId: number,
    config: IShopifyGraphQLRateLimitConfig
  ) {
    try {
      const rateLimitConfigKey = `shopify-graphql-rate-limit-config:${implementationId}`
      await this.redisClient.set(rateLimitConfigKey, JSON.stringify(config))
    } catch (error) {
      throw error
    }
  }

  async handleShopifyGraphQLRateLimit(connectionAuth: ConnectionAuth, requireQueryCost: number) {
    try {
      const implementationId = connectionAuth.implementationId
      let maximumAvailable: number
      const COST_RESTORE_TIME_IN_MS = 1000

      let queryCostRestoredPerSecond: number

      const rateLimitConfigKey = `shopify-graphql-rate-limit-config:${implementationId}` // key to store rate-limit-config like totalQueryCost, COST_RESTORE_TIME_IN_MS

      const storedConfig = (await this.redisClient.get(rateLimitConfigKey)) as string

      if (!storedConfig) {
        queryCostRestoredPerSecond =
          shopifyGraphQLPlanRateLimitConfig.find((config) => {
            return config.planDisplayName === connectionAuth?.metaInfo?.shopifyPlan?.planDisplayName
          })?.restoreRate || 50 // if we don't have rate-limit-config then for first req we assume queryCostRestoredPerSecond of 50/second

        let graphQLQueryCostKey = this.getRedisKeyForShopifyGraphQLRequest(implementationId)

        this.logger.log(
          `${JSON.stringify({ requireQueryCost, queryCostRestoredPerSecond, COST_RESTORE_TIME_IN_MS, maximumAvailable })}`
        ) // Added log for debugging purpose

        await this.redisClient.set(graphQLQueryCostKey, requireQueryCost, {
          PX: Math.ceil(requireQueryCost / queryCostRestoredPerSecond) * COST_RESTORE_TIME_IN_MS
        })
        return false
      }

      const graphQLConfig: IShopifyGraphQLRateLimitConfig = JSON.parse(storedConfig)
      maximumAvailable = graphQLConfig.maximumAvailable
      queryCostRestoredPerSecond = graphQLConfig.restoreRate

      let totalRequestedCost = 0
      // Using lock to avoid race condition
      const releaseLock = await lock(
        this.redisClient as any,
        `shopify-graphql-rate-limit:${implementationId}`,
        { timeout: 5000, pollingInterval: 100 }
      )
      let expiryTime: number
      try {
        const keyPattern = `graphql-rate-limit:${implementationId}:*`
        const keys = await this.redisClient.keys(keyPattern)
        if (keys.length) {
          const queryCosts = (await this.redisClient.mGet(keys)) as string[]
          totalRequestedCost = queryCosts.reduce((total, queryCost) => {
            return total + (parseInt(queryCost) || 0)
          }, 0)
        }
        const graphQLQueryCostKey = this.getRedisKeyForShopifyGraphQLRequest(implementationId)

        this.logger.log(
          `${JSON.stringify({ totalRequestedCost, requireQueryCost, queryCostRestoredPerSecond, COST_RESTORE_TIME_IN_MS, maximumAvailable })}`
        ) // Added log for debugging purpose

        if (totalRequestedCost + requireQueryCost <= maximumAvailable) {
          await this.redisClient.set(graphQLQueryCostKey, requireQueryCost, {
            PX:
              Math.ceil((totalRequestedCost + requireQueryCost) / queryCostRestoredPerSecond) *
              COST_RESTORE_TIME_IN_MS
          })
          return true
        }
        expiryTime =
          Math.ceil(
            (totalRequestedCost + requireQueryCost - maximumAvailable) / queryCostRestoredPerSecond
          ) * COST_RESTORE_TIME_IN_MS
        await this.redisClient.set(graphQLQueryCostKey, requireQueryCost, {
          PX:
            expiryTime +
            Math.ceil((requireQueryCost + totalRequestedCost) / queryCostRestoredPerSecond) *
              COST_RESTORE_TIME_IN_MS
        })
      } catch (error) {
        throw error
      } finally {
        releaseLock()
      }
      await new Promise((resolve) => setTimeout(resolve, expiryTime + 10)) // 10ms extra to avoid rate-limit issue
      return true
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }
}
