import { TargetSystemEnum } from '../../core/types/common.types'
import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable, Logger } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Observable, concatMap, from, map } from 'rxjs'
import { ConnectionAuth } from '../../connection-auths/entities/connection-auth.entity'
import { getErrorLog, getErrorText, getRequestLog, getResponseLog } from '../utils/log-mapper.utils'
import { RateLimitUtil } from '../utils/rate-limit.util'
import { QueryProductDto } from './dtos/query-product.dto'
import { ShopDto } from './dtos/shop.dto'
import { ShopifyCalulateRefundDto } from './dtos/shopify-calculate-refund.dto'
import { ShopifyCalculateRefundResponseDto } from './dtos/shopify-calulate-refund-response.dto'
import { ShopifyConfigAuthDto } from './dtos/shopify-config-auth.dto'
import { ShopifyCreateRefundResponseDto } from './dtos/shopify-create-refund-response.dto'
import { ShopifyFulfillmentOrderDto } from './dtos/shopify-fulfillment-order.dto'
import { ShopifyFulfillmentServiceDto } from './dtos/shopify-fulfillment-service.dto'
import { ShopifyInventoryItemDto } from './dtos/shopify-inventory-item.dto'
import {
  ShopifyInventoryLevelDto,
  ShopifyInventoryLevelGraphQlDto,
  ShopifyMultipleInventoryLevelGraphQlDto
} from './dtos/shopify-inventory-level.dto'
import { ShopifyOrderDto } from './dtos/shopify-order.dto'
import { PageInfoDto } from './dtos/shopify-page-info.dto'
import { ShopifyProductVariantGraphQlDto } from './dtos/shopify-product-variant.dto'
import { ShopifyShipmentDto } from './dtos/shopify-shipment.dto'
import { ShopifyShippingZoneDto } from './dtos/shopify-shipping-zone.dto'
import { ShopifyConfigService } from './shopify.config'

@Injectable()
export class HttpShopifyService {
  private readonly logger = new Logger(HttpShopifyService.name)
  private http: HttpService

  constructor(private rateLimitUtil: RateLimitUtil) {
    this.http = new HttpService(axios.create())
    this.configureResponseInterceptor(<AxiosInstance>this.http.axiosRef)
    this.configureRequestInterceptor(<AxiosInstance>this.http.axiosRef)
  }

  private getConfig(
    connectionAuth: ConnectionAuth<TargetSystemEnum.SHOPIFY>
  ): ShopifyConfigAuthDto | AxiosRequestConfig {
    if (connectionAuth.authStrategy === 'auth-token') {
      const keyName = connectionAuth.authObject['keyName']
      const token = connectionAuth.authObject['token']

      return <AxiosRequestConfig>{
        baseURL: connectionAuth.connectionUrl,
        headers: {
          [keyName]: token,
          'Content-Type': 'application/json'
        }
      }
    }

    return {
      baseURL: connectionAuth.connectionUrl,
      auth: {
        username: connectionAuth.authObject['accessKey'],
        password: connectionAuth.authObject['secretKey']
      }
    }
  }
  private configureRequestInterceptor(axios: AxiosInstance): void {
    axios.interceptors.request.clear()
    axios.interceptors.request.use((request) => {
      const log = getRequestLog(request)
      this.logger.log({ message: 'starting Shopify request', shopifyRequest: log })
      return request
    })
  }

  private configureResponseInterceptor(axios: AxiosInstance): void {
    axios.interceptors.response.clear()
    axios.interceptors.response.use(
      (response) => {
        const log = getResponseLog(response)
        this.logger.log({ message: 'received Shopify response', shopifyResponse: log })
        return response
      },
      (error) => {
        const log = getErrorLog(error, this.logger)
        const errorText = getErrorText(error, this.logger)
        let errorMessage: string
        if (typeof error?.response?.data?.errors === 'object') {
          errorMessage = JSON.stringify(error?.response?.data?.errors)
        } else {
          errorMessage = error?.response?.data?.errors
        }
        this.logger.error(
          `Shopify request ${log.baseURL}/${log.url} failed with status ${log.status}${errorText} errors: ${errorMessage}`
        )
        throw new HttpException(
          error?.response?.data?.errors || error?.message,
          error?.response?.status
        )
      }
    )
  }

  getOrderList(
    configObj: ConnectionAuth,
    data
  ): Observable<{ headers: any; orders: ShopifyOrderDto[] }> {
    const queryParameters = new URLSearchParams(data.query).toString()
    let url = `${ShopifyConfigService.getEndpoint('OrderListEndpoint')}?${queryParameters}`

    return this.http.get(url, { ...this.getConfig(configObj) }).pipe(
      map((response) => {
        return {
          headers: response.headers,
          orders: response.data['orders']
        }
      })
    )
  }

  getAssignedFulfillmentOrdersList(
    configObj: ConnectionAuth,
    data
  ): Observable<{ headers: any; fulfillmentOrders: ShopifyFulfillmentOrderDto[] }> {
    if (data.nextPage) {
      const queryParams = new URLSearchParams(data.nextPage.split('?')[1])
      data.query = { ...Object.fromEntries(queryParams), ...data.query }
    }
    const queryParameters = new URLSearchParams(data.query).toString()
    const url = `${ShopifyConfigService.getEndpoint('AssignedFulfillmentOrders')}?${queryParameters}`

    return this.http.get(url, { ...this.getConfig(configObj) }).pipe(
      map((response) => {
        return {
          headers: response.headers,
          fulfillmentOrders: response.data['fulfillment_orders']
        }
      })
    )
  }

  getProductList(
    configObj: ConnectionAuth,
    data: { nextPage: PageInfoDto | undefined; query: QueryProductDto }
  ): Observable<{ pageInfo: PageInfoDto; productVariants: ShopifyProductVariantGraphQlDto[] }> {
    const condition = [`first:${data.query.limit}`]
    const query = [`product_status:${data.query.product_status}`]
    if (data.nextPage) {
      condition.push(`after:"${data.nextPage?.endCursor}"`)
    }
    if (data.query.updated_at_min) {
      query.push(`updated_at:>'${data.query.updated_at_min}'`)
    }
    return this.http
      .post(
        ShopifyConfigService.getEndpoint('GraphQL'),
        {
          query: `{ productVariants(${condition.join(', ')}, query: \"${query.join(' AND ')}\") { nodes {  id sku title barcode price updatedAt inventoryQuantity product { id title descriptionHtml featuredMedia{ preview{ image{ url } } } status } image { id url } inventoryItem { id measurement { weight { value unit } } } } pageInfo { hasNextPage endCursor } } } `
        },
        { ...this.getConfig(configObj) }
      )
      .pipe(
        map((response) => {
          return {
            pageInfo: response.data?.data?.productVariants?.pageInfo,
            productVariants: response.data?.data?.productVariants?.nodes
          }
        })
      )
  }

  getInventoryFilter(configObj: ConnectionAuth, data): Observable<ShopifyInventoryItemDto[]> {
    return this.http
      .get(ShopifyConfigService.getEndpoint('InventoryListEndpoint'), {
        params: data,
        ...this.getConfig(configObj)
      })
      .pipe(map((response) => response.data['inventory_items']))
  }

  getInventoryLevels(
    configObj: ConnectionAuth,
    data: { location_ids?: string; inventory_item_ids?: string }
  ): Observable<ShopifyInventoryLevelDto[]> {
    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .get(ShopifyConfigService.getEndpoint('InventoryLevelListEndpoint'), {
            params: data,
            ...this.getConfig(configObj)
          })
          .pipe(map((response) => response.data['inventory_levels']))
      )
    )
  }

  getInventoryLevelsViaGraphQL(
    configObj: ConnectionAuth,
    data: { locationId: string; inventoryItemId: string }
  ): Observable<ShopifyInventoryLevelGraphQlDto> {
    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { inventoryItem(id: \"gid://shopify/InventoryItem/${data.inventoryItemId}\") { inventoryLevel(locationId: \"gid://shopify/Location/${data.locationId}\") { id quantities(names: [\"available\", \"incoming\", \"committed\", \"damaged\", \"on_hand\", \"quality_control\", \"reserved\", \"safety_stock\"]) { name quantity } } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(map((response) => response.data?.data?.inventoryItem?.inventoryLevel))
      )
    )
  }

  getManyInventoryItemsInventoryLevelsViaGraphQL(
    configObj: ConnectionAuth,
    data: { locationId: string; inventoryItemIds: string[] }
  ): Observable<ShopifyMultipleInventoryLevelGraphQlDto[]> {
    const itemQueries = data.inventoryItemIds
      .map(
        (itemId) => `
          item_${itemId}:inventoryItem(id: "gid://shopify/InventoryItem/${itemId}") {
            inventoryLevel(locationId: "gid://shopify/Location/${data.locationId}") {
              id
              quantities(names: ["available", "incoming", "committed", "damaged", "on_hand", "quality_control", "reserved", "safety_stock"]) {
                name
                quantity
              }
            }
          }
        `
      )
      .join('\n')

    const query = `query {
      ${itemQueries}
    }`

    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            { query: query },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              const items = data.inventoryItemIds.map((itemId) => {
                const inventoryLevel = response.data?.data[`item_${itemId}`]?.inventoryLevel
                if (!inventoryLevel) return null
                return { ...inventoryLevel, inventoryItemId: itemId }
              })
              return items.filter((item) => item)
            })
          )
      )
    )
  }

  getSubscribedWebhooks(
    configObj: ConnectionAuth,
    data: { limit?: number; endCursor?: string }
  ): Observable<Record<string, any>> {
    const conditions = [`first: ${data.limit || 100}`]
    if (data.endCursor) conditions.push(`after: "${data.endCursor}"`)

    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { webhookSubscriptions(${conditions.join(', ')}) { edges { node { id topic callbackUrl format createdAt } } pageInfo { hasNextPage endCursor } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(map((response) => response.data?.data?.webhookSubscriptions))
      )
    )
  }

  subscribeWebhook(
    configObj: ConnectionAuth,
    data: { topic: string; callbackUrl: string }
  ): Observable<Record<string, any>> {
    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation { webhookSubscriptionCreate( topic: ${data.topic}, webhookSubscription: { callbackUrl: "${data.callbackUrl}", format: JSON } ) { webhookSubscription { id topic callbackUrl } userErrors { field message } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(map((response) => response.data?.data?.webhookSubscriptionCreate))
      )
    )
  }

  unSubscribeWebhook(
    configObj: ConnectionAuth,
    data: { id: number }
  ): Observable<Record<string, any>> {
    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation { webhookSubscriptionDelete(id: "gid://shopify/WebhookSubscription/${data.id}") { deletedWebhookSubscriptionId userErrors { field message } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(map((response) => response.data?.data?.webhookSubscriptionDelete))
      )
    )
  }

  updateInventoryLevel(
    configObj: ConnectionAuth,
    inventoryLevel
  ): Observable<ShopifyInventoryLevelDto> {
    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .post(
            ShopifyConfigService.getEndpoint('SetInventoryLevelEndpoint'),
            { ...inventoryLevel },
            { ...this.getConfig(configObj) }
          )
          .pipe(map((response) => response.data['inventory_level']))
      )
    )
  }

  cancelFulfillmentOrder(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderId: string; message?: string }
  ): Observable<ShopifyFulfillmentOrderDto> {
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('FulfillmentOrderEndpoint')}/${data.fulfillmentOrderId}/cancel.json`,
        { message: data.message },
        { ...this.getConfig(configObj) }
      )
      .pipe(map((response) => response.data['fulfillment_order']))
  }

  sendCancellationRequestToFulfillmentService(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderId: string; message?: string }
  ): Observable<ShopifyFulfillmentOrderDto> {
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('FulfillmentOrderEndpoint')}/${data.fulfillmentOrderId}/cancellation_request.json`,
        { message: data.message },
        { ...this.getConfig(configObj) }
      )
      .pipe(map((response) => response.data['fulfillment_order']))
  }

  cancelOrder(
    configObj: ConnectionAuth,
    data: { customerOrderId: string; reason?: string }
  ): Observable<ShopifyOrderDto> {
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('OrderEndpoint')}/${data.customerOrderId}/cancel.json`,
        { email: true, reason: data.reason || 'reason not available' },
        { ...this.getConfig(configObj) }
      )
      .pipe(map((response) => response.data['order']))
  }

  cancelAndRefundOrder(
    configObj: ConnectionAuth,
    data: { customerOrderId: string; refundDto: ShopifyCalculateRefundResponseDto; reason?: string }
  ): Observable<ShopifyOrderDto> {
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('OrderEndpoint')}/${data.customerOrderId}/cancel.json`,
        { refund: data.refundDto, email: true, reason: data.reason || 'reason not available' },
        this.getConfig(configObj)
      )
      .pipe(map((response) => response.data['order']))
  }

  acceptFulfillment(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderId: string }
  ): Observable<any> {
    return from(this.rateLimitUtil.handleRateLimit(configObj)).pipe(
      concatMap(() =>
        this.http
          .post(
            `${ShopifyConfigService.getEndpoint('FulfillmentOrderEndpoint')}/${data.fulfillmentOrderId}/fulfillment_request/accept.json`,
            undefined,
            { ...this.getConfig(configObj) }
          )
          .pipe(map((response) => response.data['fulfillment_order']))
      )
    )
  }

  createFulfillment(configObj: ConnectionAuth, data: any): Observable<ShopifyShipmentDto> {
    this.logger.log({
      message: 'createFulfillment configObj',
      data: { implementationId: configObj.implementationId }
    })
    this.logger.log({
      message: 'createFulfillment payload',
      data: { fulfillment: data.shopShipmentDto }
    })
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('FulfillmentEndpoint')}.json`,
        { fulfillment: data.shopShipmentDto },
        this.getConfig(configObj)
      )
      .pipe(map((response) => response.data['fulfillment']))
  }

  calculateRefund(
    configObj: ConnectionAuth,
    data: { customerOrderId: string; refundDto: ShopifyCalulateRefundDto }
  ): Observable<ShopifyCalculateRefundResponseDto> {
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('RefundEndpoint')}/${data.customerOrderId}/refunds/calculate.json`,
        { refund: data.refundDto },
        this.getConfig(configObj)
      )
      .pipe(map((response) => response.data['refund']))
  }

  createRefund(
    configObj: ConnectionAuth,
    data: { customerOrderId: string; refundDto: ShopifyCalculateRefundResponseDto }
  ): Observable<ShopifyCreateRefundResponseDto> {
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('RefundEndpoint')}/${data.customerOrderId}/refunds.json`,
        { refund: data.refundDto },
        this.getConfig(configObj)
      )
      .pipe(map((response) => response.data))
  }

  getFulfillmentOrder(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderId: string }
  ): Observable<ShopifyFulfillmentOrderDto> {
    return this.http
      .get(
        `${ShopifyConfigService.getEndpoint('FulfillmentOrderEndpoint')}/${data.fulfillmentOrderId}.json`,
        { ...this.getConfig(configObj) }
      )
      .pipe(map((response) => response.data['fulfillment_order']))
  }

  getShopDetails(configObj: ConnectionAuth): Observable<ShopDto> {
    return this.http
      .get(`${ShopifyConfigService.getEndpoint('ShopEndpoint')}`, { ...this.getConfig(configObj) })
      .pipe(map((response) => response.data['shop']))
  }

  getFulfillmentServices(configObj: ConnectionAuth): Observable<ShopifyFulfillmentServiceDto[]> {
    return this.http
      .get(
        `${ShopifyConfigService.getEndpoint('FulfillmentServiceEndpoint')}.json?scope=all`,
        this.getConfig(configObj)
      )
      .pipe(map((response) => response.data['fulfillment_services']))
  }

  createFulfillmentService(
    configObj: ConnectionAuth,
    data: any
  ): Observable<ShopifyFulfillmentServiceDto> {
    return this.http
      .post(
        `${ShopifyConfigService.getEndpoint('FulfillmentServiceEndpoint')}.json`,
        data,
        this.getConfig(configObj)
      )
      .pipe(map((response) => response.data['fulfillment_service']))
  }

  getShippingMethods(configObj: ConnectionAuth): Observable<ShopifyShippingZoneDto> {
    return this.http
      .get(
        `${ShopifyConfigService.getEndpoint('ShippingMethodsEndpoint')}.json`,
        this.getConfig(configObj)
      )
      .pipe(map((response) => response.data))
  }

  exchangeOAuthCodeForToken(
    shop: string,
    code: string,
    clientId: string,
    clientSecret: string
  ): Observable<{ access_token: string; scope: string }> {
    const url = `${shop}/${ShopifyConfigService.getEndpoint('ExchangeOAuthCodeForToken')}`

    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      code: code
    }

    return this.http.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map((response) => response.data)
    )
  }
}
