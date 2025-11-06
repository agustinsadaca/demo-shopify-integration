import { BullRootModuleOptions } from '@nestjs/bull'
import { KafkaOptions, Transport } from '@nestjs/microservices'
import { AxiosRequestConfig } from 'axios'
import process from 'process'
import { kafka_broker } from './config/config'
import { createQueueRedisClient } from './config/redis-queue-client.config'
import { RedisModuleOptions } from './global-modules/redis'
require('dotenv').config()

export class ConfigService {
  static isKafkaEnabled(): boolean {
    return (
      (process.env.kafka_enabled && process.env.kafka_enabled === 'true') ||
      process.env.stage != 'local'
    )
  }

  static isRedisEnabled(): boolean {
    return (
      (process.env.redis_enabled && process.env.redis_enabled === 'true') ||
      process.env.stage != 'local'
    )
  }

  static kafkaConfig(): KafkaOptions {
    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'DemoShopifykafka',
          brokers: kafka_broker!
        },
        consumer: {
          groupId: 'demo-shopify-kafka-consumer'
        }
      }
    }
  }

  static middlewareAxiosRequestConfig(): AxiosRequestConfig {
    const baseUrl = process.env[`demo_shopify_middleware_${process.env.stage}_host`]
    return {
      baseURL: baseUrl,
      headers: {
        Authorization: 'Bearer '
      }
    }
  }

  static cognitoConfig() {
    return {
      userPoolId: process.env[`demo_shopify_cognito_user_pool_id_${process.env.stage}`],
      clientId: process.env[`demo_shopify_cognito_client_id_${process.env.stage}`],
      region: process.env.region,
      authority: `https://cognito-idp.${process.env.region}.amazonaws.com/${process.env[`demo_shopify_cognito_user_pool_id_${process.env.stage}`]}`
    }
  }

  static configureAwsInstance(aws) {
    aws.config.update({
      region: process.env.region,
      accessKeyId: process.env.aws_key,
      secretAccessKey: process.env.aws_secret
    })
  }

  static paginationConfig() {
    return {
      DEFAULT_PAGE: +(process.env.DEFAULT_PAGE || '1'),
      DEFAULT_PAGE_LIMIT: +(process.env.DEFAULT_PAGE_LIMIT || '10'),
      MIN_PAGE_LIMIT: +(process.env.MIN_PAGE_LIMIT || '10'),
      MAX_PAGE_LIMIT: +(process.env.MAX_PAGE_LIMIT || '100')
    }
  }

  static getInitialSyncDate() {
    return process.env.DEFAULT_INITIAL_SYNC_DATE || '2021-01-01T00:00:00+01:00'
  }

  static getAwsKeyAndSecret = (): { aws_key: string; aws_secret: string } => {
    const credentials = {
      aws_key: '',
      aws_secret: ''
    }
    const demoShopifyAwsCreds = process.env.demo_shopify_aws_creds

    if (!demoShopifyAwsCreds) return credentials

    const parsedDemoShopifyAwsCreds = JSON.parse(demoShopifyAwsCreds)

    return {
      aws_key: parsedDemoShopifyAwsCreds?.aws_key,
      aws_secret: parsedDemoShopifyAwsCreds?.aws_secret
    }
  }

  static getNosConfig() {
    const credentials = {
      user: '',
      password: '',
      url: ''
    }
    const nosCredentials = process.env.nos_mailer_api_creds

    if (!nosCredentials) return credentials

    const parsedNosCredentials = JSON.parse(nosCredentials)

    return {
      user: parsedNosCredentials?.user,
      password: parsedNosCredentials?.password,
      url: process.env.nos_url
    }
  }

  static getEncryptionKey() {
    const key: string = ''
    const encryptionKey = process.env.encryption_key
    if (!encryptionKey) return key

    return encryptionKey
  }

  static redisConfig(): RedisModuleOptions {
    const parseRedisOptions = JSON.parse(process.env[`redis_config`] || '{}')

    return parseRedisOptions
  }

  static shopIntegrationApiKey(): string {
    return process.env.shop_integration_api_key!
  }

  static bullQueueConfig(): BullRootModuleOptions {
    const redisConfig = this.redisConfig()

    const bullOptions: BullRootModuleOptions = {
      url: redisConfig.url,
      prefix: 'demo-shopify-queue',
      defaultJobOptions: {
        attempts: 2,
        stackTraceLimit: 20,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      },
      limiter: {
        max: 3,
        duration: 10000
      }
    }

    // the will use only one instance of redis client during pact test only
    if (process.env.NODE_ENV === 'pact') {
      bullOptions.createClient = createQueueRedisClient(this.redisConfig())
    }

    return bullOptions
  }

  static getUnleashConfig() {
    return {
      url: process.env.FEATURE_FLAG_APP_URL,
      appName: 'demo-shopify-connector',
      environment: process.env.stage !== 'prod' ? 'development' : 'production',
      customHeaders: {
        Authorization: process.env.FEATURE_FLAG_API_KEY
      },
      refreshInterval: 10 * 1000
    }
  }
}
