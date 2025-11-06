import { Inject, Logger, OnModuleInit } from '@nestjs/common'
import * as Sentry from '@sentry/nestjs'
import { REDIS_IO_CLIENT, RedisClient } from '../global-modules/redis'

type SentryIgnoreBreadCrumbData = {
  urls: string[]
}

export class SentryUtilService implements OnModuleInit {
  private readonly logger = new Logger(SentryUtilService.name)

  static ignoreEventPatternsKey = 'sentry:connector:ignoreEventPatterns'
  static ignoreBreadcrumbPatternsKey = 'sentry:connector:ignoreBreadcrumbPatterns'

  static ignoreEventPatterns = [
    'Inventory item level is empty for sku',
    'shopify_inventory_item_id or shopify_inventory_item_gid of inventoryItemId',
    'Could not find any brand label with domain',
    'ERROR [Connection] Response Heartbeat(key:',
    'Order records not found!'
  ]
  static ignoreBreadcrumbPatterns: SentryIgnoreBreadCrumbData = {
    urls: ['']
  }

  constructor(@Inject(REDIS_IO_CLIENT) private readonly redisClient: RedisClient) {}

  onModuleInit() {
    this.setup()
    setInterval(
      () => {
        this.setup()
      },
      1000 * 60 * 5 // 5 minutes
    )
  }

  async setup() {
    try {
      this.logger.log('setting up sentry config...')
      const ignoreEventPatterns = await this.redisClient.lRange(
        SentryUtilService.ignoreEventPatternsKey,
        0,
        -1
      )
      const ignoreBreadcrumbPatterns = await this.redisClient.get(
        SentryUtilService.ignoreBreadcrumbPatternsKey
      )

      if (ignoreEventPatterns)
        this.updateIgnoreEventPatterns(ignoreEventPatterns?.map((pattern) => pattern.toString()))

      if (ignoreBreadcrumbPatterns)
        this.updateIgnoreBreadcrumbPatterns(JSON.parse(ignoreBreadcrumbPatterns as string))

      this.logger.log('sentry config setup complete')
    } catch (error) {
      this.logger.error(error)
    }
  }

  private updateIgnoreEventPatterns(ignoreEventPatterns: string[]) {
    if (!ignoreEventPatterns || ignoreEventPatterns.length === 0) return

    SentryUtilService.ignoreEventPatterns = ignoreEventPatterns.map((pattern) => pattern.toString())

    this.logger.log(
      `updated ignore event patterns: '${ignoreEventPatterns.map((pattern) => pattern).join(', ')}'`
    )
  }

  private updateIgnoreBreadcrumbPatterns(ignoreBreadcrumbPatterns: SentryIgnoreBreadCrumbData) {
    if (!ignoreBreadcrumbPatterns) return
    this.updateBreadCrumbUrlPatterns(ignoreBreadcrumbPatterns.urls)
  }

  private updateBreadCrumbUrlPatterns(urls: string[]) {
    if (!urls || urls.length === 0) return

    SentryUtilService.ignoreBreadcrumbPatterns.urls = urls

    this.logger.log(
      `updated ignore breadcrumb url patterns: '${urls.map((url) => url).join(', ')}'`
    )
  }

  static getIgnoreEventPatterns() {
    return this.ignoreEventPatterns
  }

  static isIgnoreEvent(event: Sentry.ErrorEvent): boolean {
    const errorMessage = event.exception.values[0].value
    if (!errorMessage) return false

    for (const pattern of this.ignoreEventPatterns) {
      if (errorMessage.includes(pattern)) return true
    }
    return false
  }

  static isIgnoreBreadcrumb(breadcrumb: Sentry.Breadcrumb): boolean {
    if (breadcrumb.category !== 'http') return false

    const url = breadcrumb.data?.url
    if (!url) return false

    for (const pattern of this.ignoreBreadcrumbPatterns.urls) {
      if (url.includes(pattern)) return true
    }

    return false
  }
}
