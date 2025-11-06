import { TargetSystemEnum } from '../../core/types/common.types'
import { ShopifyGraphQLId } from '../../core/types/common.types'
import { ShopifyResources } from '../../core/types/common.types'
import { HttpService } from '@nestjs/axios'
import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { catchError, concatMap, from, map, Observable } from 'rxjs'
import { ConnectionAuth } from '../../connection-auths/entities/connection-auth.entity'
import { getErrorLog, getErrorText, getRequestLog, getResponseLog } from '../utils/log-mapper.utils'
import { RateLimitUtil } from '../utils/rate-limit.util'
import { QueryFulfillmentOrderMetaInfoDto, QueryShopifyGetOrderDto } from './dtos/query-order.dto'
import { QueryProductDto, QueryProductMetaInfoDto } from './dtos/query-product.dto'
import { ShopGraphQLDto } from './dtos/shop.dto'
import { ShopifyCalculateRefundGraphQLDto } from './dtos/shopify-calculate-refund.dto'
import { ShopifyCalculateRefundResponseGraphQLDto } from './dtos/shopify-calulate-refund-response.dto'
import { ShopifyConfigAuthDto } from './dtos/shopify-config-auth.dto'
import { ShopifyCreateRefundResponseGraphQLDto } from './dtos/shopify-create-refund-response.dto'
import { ShopifyCreateRefundGraphQLDto } from './dtos/shopify-create-refund.dto'
import {
  ShopifyFulfillmentOrderDetailsGraphQLDto,
  ShopifyFulfillmentOrderGraphQLDto,
  ShopifyFulfillmentOrdersMetaInfoGraphQlDto
} from './dtos/shopify-fulfillment-order.dto'
import { ShopifyFulfillmentServiceGraphQLDto } from './dtos/shopify-fulfillment-service.dto'
import { ShopifyInventoryItemGraphQLDto } from './dtos/shopify-inventory-item.dto'
import {
  ShopifyInventoryLevelGraphQlDto,
  ShopifyMultipleInventoryLevelGraphQlDto
} from './dtos/shopify-inventory-level.dto'
import { PageInfoDto } from './dtos/shopify-page-info.dto'
import {
  ShopifyProductVariantGraphQlDto,
  ShopifyProductVariantMetaInfoGraphQlDto
} from './dtos/shopify-product-variant.dto'
import { ShopifyShipmentGraphQLDto } from './dtos/shopify-shipment.dto'
import { ShopifyShippingZoneGraphQLDto } from './dtos/shopify-shipping-zone.dto'
import { EShopifyGraphQLQueryCost } from './enums/shopify-graphql-query-cost.enum'
import { ShopifyOrderCancelReason } from './enums/shopify-order-cancel-reason.enum'
import { ShopifyConfigService } from './shopify.config'

@Injectable()
export class GraphQLShopifyService {
  private readonly logger = new Logger(GraphQLShopifyService.name)
  private http: HttpService

  constructor(private readonly rateLimitUtil: RateLimitUtil) {
    this.http = new HttpService(axios.create())
    this.configureRequestInterceptor(<AxiosInstance>this.http.axiosRef)
    this.configureResponseInterceptor(<AxiosInstance>this.http.axiosRef)
  }

  private configureRequestInterceptor(axios: AxiosInstance): void {
    axios.interceptors.request.clear()
    axios.interceptors.request.use((request) => {
      const log = getRequestLog(request)
      this.logger.log({
        message: 'starting Shopify Graphql request',
        shopifyGraphqlRequestData: log
      })
      return request
    })
  }

  private configureResponseInterceptor(axios: AxiosInstance): void {
    axios.interceptors.response.clear()
    axios.interceptors.response.use((response) => {
      const mutationKey = response?.data?.data && Object.keys(response?.data?.data)[0]
      if (
        response.data?.errors ||
        response.data?.data?.[mutationKey]?.userErrors?.length ||
        response.data?.data?.[mutationKey]?.orderCancelUserErrors?.length
      ) {
        throw response
      }
      const log = getResponseLog(response)
      this.logger.log({
        message: 'received Shopify Graphql response',
        shopifyGraphqlResponseData: log
      })
      return response
    })
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

  private handleHttpBasedError(errorRes): never {
    const log = getErrorLog(errorRes, this.logger)
    const errorText = getErrorText(errorRes, this.logger)
    let errorMessage: string
    if (typeof errorRes?.response?.data?.errors === 'object') {
      errorMessage = JSON.stringify(errorRes?.response?.data?.errors)
    } else {
      errorMessage = errorRes?.response?.data?.errors
    }
    this.logger.error(
      `Shopify request ${log.baseURL}/${log.url} failed with status ${log.status}${errorText} errors: ${errorMessage}`
    )
    throw new HttpException(errorMessage || errorRes?.message, errorRes?.response?.status)
  }

  private handleQueryBasedGraphQLError(errorRes: AxiosResponse): never {
    const errorMessage: string[] = []
    for (let error of errorRes.data?.errors) {
      errorMessage.push(error.message)
    }

    const errorsObj = JSON.stringify(errorRes.data?.errors)
    this.logger.error(
      `Shopify request ${errorRes.config.baseURL}/${errorRes.config.url} failed with status ${errorRes.status} query: ${errorRes.config.data} errors: ${errorsObj}`
    )
    throw new BadRequestException(errorMessage)
  }

  private handleMutationBasedGraphQLError(errorRes: AxiosResponse): never {
    const mutationKey = Object.keys(errorRes?.data?.data)[0]
    const errorMessage: string[] = []
    for (let error of errorRes?.data?.data?.[mutationKey]?.userErrors) {
      errorMessage.push(error.message)
    }
    const errorsObj = JSON.stringify(errorRes.data)
    this.logger.error(
      `Shopify request ${errorRes.config.baseURL}/${errorRes.config.url} failed with status ${errorRes.status} Mutation: ${errorRes.config.data} errors: ${errorsObj}`
    )
    throw new BadRequestException(errorMessage)
  }

  private catchGraphQLError(errorRes): never {
    if (errorRes.data?.errors) {
      this.handleQueryBasedGraphQLError(errorRes)
    }
    if (errorRes?.data?.data) {
      this.handleMutationBasedGraphQLError(errorRes)
    }
    this.handleHttpBasedError(errorRes)
  }

  getProductList(
    configObj: ConnectionAuth,
    data: { nextPage: PageInfoDto | undefined; query: QueryProductDto }
  ): Observable<{
    pageInfo: PageInfoDto
    productVariants: ShopifyProductVariantGraphQlDto[]
  }> {
    const condition = [`first:${data.query.limit}`]
    const query = [`product_status:${data.query.product_status}`]
    if (data.nextPage) {
      condition.push(`after:"${data.nextPage?.endCursor}"`)
    }
    if (data.query.updated_at_min) {
      query.push(`updated_at:>'${data.query.updated_at_min}'`)
    }
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getProductVariants
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { productVariants(${condition.join(', ')}, query: \"${query.join(' AND ')}\") { nodes {  id sku title barcode price updatedAt legacyResourceId inventoryQuantity product { id title descriptionHtml featuredMedia{ preview{ image{ url } } } status } image { id url } inventoryItem { id legacyResourceId measurement { weight { value unit } } } } pageInfo { hasNextPage endCursor } } } `
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                // need to add configuration to redis if it is not there
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return {
                pageInfo: response.data?.data?.productVariants?.pageInfo,
                productVariants: response.data?.data?.productVariants?.nodes
              }
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getInventoryFilter(
    configObj: ConnectionAuth,
    data: { nextPage: PageInfoDto | undefined; query: { limit: number; ids: string[] } }
  ): Observable<{
    pageInfo: PageInfoDto
    inventoryItems: ShopifyInventoryItemGraphQLDto[]
  }> {
    const condition = [`first:${data.query.limit}`]
    if (data.nextPage?.hasNextPage) {
      condition.push(`after:"${data.nextPage?.endCursor}"`)
    }
    const query = [data.query.ids.map((id) => `id:${id}`).join(' OR ')]

    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getInventoryFilter
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { inventoryItems(  ${condition.join(', ')},  query: \"${query.join(' AND ')}\") {  nodes {    id    legacyResourceId    countryCodeOfOrigin    harmonizedSystemCode  }  pageInfo {    hasNextPage    endCursor  }}}`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return {
                pageInfo: response.data?.data?.inventoryItems?.pageInfo,
                inventoryItems: response.data?.data?.inventoryItems?.nodes
              }
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getInventoryLevels(
    configObj: ConnectionAuth,
    data: {
      query: { locationId: string; inventoryItemId: string }
    }
  ): Observable<ShopifyInventoryLevelGraphQlDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getInventoryLevels
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { inventoryItem(id: "${data.query.inventoryItemId}") { inventoryLevel(locationId: "${data.query.locationId}") { id quantities(names: [\"available\", \"incoming\", \"committed\", \"damaged\", \"on_hand\", \"quality_control\", \"reserved\", \"safety_stock\"]) { name quantity } } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.inventoryItem?.inventoryLevel
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getManyInventoryItemsInventoryLevels(
    configObj: ConnectionAuth,
    data: {
      locationId: string
      inventoryItemIds: { [key: string]: string }
    }
  ): Observable<ShopifyMultipleInventoryLevelGraphQlDto[]> {
    const itemQueries = Object.entries(data.inventoryItemIds)
      .map(
        (itemId) => `
          item_${itemId[0]}:inventoryItem(id: "${itemId[1]}") {
            inventoryLevel(locationId: "${data.locationId}") {
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

    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getInventoryLevels * Object.keys(data.inventoryItemIds).length
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            { query: query },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              const items = Object.entries(data.inventoryItemIds).map((itemId) => {
                const inventoryLevel = response.data?.data[`item_${itemId[0]}`]?.inventoryLevel
                if (!inventoryLevel) return null
                return { ...inventoryLevel, inventoryItemId: itemId[0] }
              })
              return items.filter((item) => item)
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  updateInventoryLevel(
    configObj: ConnectionAuth,
    data: { query: { inventoryItemId: string; locationId: string; quantity: number } }
  ): Observable<{}> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.updateInventoryLevel
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation {inventorySetQuantities(input: {  ignoreCompareQuantity: true  name: "available",  reason: "correction",  quantities: [  {  inventoryItemId: "${data.query.inventoryItemId}",  locationId: "${data.query.locationId}",  quantity: ${data.query.quantity}  }  ]}) {  userErrors {  field  message  }}}`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return {}
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getProductMetaInfo(
    configObj: ConnectionAuth,
    data: { nextPage: PageInfoDto | undefined; query: QueryProductMetaInfoDto }
  ): Observable<{
    pageInfo: PageInfoDto
    productVariantsMetaInfo: ShopifyProductVariantMetaInfoGraphQlDto[]
  }> {
    const condition = [`first:${data.query.limit}`]
    const query = [`${data.query.customerItemIdsQuery}`]
    if (data.nextPage?.hasNextPage) {
      condition.push(`after:"${data.nextPage?.endCursor}"`)
    }
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getProductMetaInfo
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query {  productVariants(${condition.join(', ')}, query:\"${query.join(' AND ')}\") {  nodes {  id legacyResourceId inventoryItem {  id  legacyResourceId }  }  pageInfo { hasNextPage endCursor  }  } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return {
                pageInfo: response.data?.data?.productVariants?.pageInfo,
                productVariantsMetaInfo: response.data?.data?.productVariants?.nodes
              }
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getSubscribedWebhooks(
    configObj: ConnectionAuth,
    data: { limit?: number; endCursor?: string }
  ): Observable<Record<string, any>> {
    const conditions = [`first: ${data.limit || 100}`]
    if (data.endCursor) conditions.push(`after: "${data.endCursor}"`)
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getSubscribedWebhooks
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { webhookSubscriptions(${conditions.join(', ')}) { edges { node { id topic endpoint{ ... on WebhookHttpEndpoint{ callbackUrl } } format createdAt } } pageInfo { hasNextPage endCursor } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.webhookSubscriptions
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  subscribeWebhook(
    configObj: ConnectionAuth,
    data: { topic: string; callbackUrl: string }
  ): Observable<Record<string, any>> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.subscribeWebhook
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation { webhookSubscriptionCreate( topic: ${data.topic}, webhookSubscription: { callbackUrl: "${data.callbackUrl}", format: JSON } ) { webhookSubscription { id topic endpoint{ ... on WebhookHttpEndpoint{ callbackUrl } } } userErrors { field message } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.webhookSubscriptionCreate
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  unSubscribeWebhook(
    configObj: ConnectionAuth,
    data: { id: string }
  ): Observable<Record<string, any>> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.unSubscribeWebhook
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation { webhookSubscriptionDelete(id: "${data.id}") { deletedWebhookSubscriptionId userErrors { field message } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.webhookSubscriptionDelete
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getFulfillmentServices(
    configObj: ConnectionAuth
  ): Observable<ShopifyFulfillmentServiceGraphQLDto[]> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getFulfillmentServices
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query {shop { fulfillmentServices { id serviceName location {   id   legacyResourceId   name } }}}`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.shop?.fulfillmentServices
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  createFulfillmentService(
    configObj: ConnectionAuth,
    data: {
      name: string
      callbackUrl: string
      inventoryManagement: boolean
      trackingSupport: boolean
    }
  ): Observable<ShopifyFulfillmentServiceGraphQLDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.createFulfillmentService
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation {fulfillmentServiceCreate( name: "${data.name}", callbackUrl: "${data.callbackUrl}", inventoryManagement: ${data.inventoryManagement}, trackingSupport: ${data.trackingSupport}){ fulfillmentService{ id serviceName location { id legacyResourceId name }} userErrors{ field message } }}`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.fulfillmentServiceCreate?.fulfillmentService
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getShopDetails(configObj: ConnectionAuth): Observable<ShopGraphQLDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getShopDetails
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query {shop { orderNumberFormatPrefix orderNumberFormatSuffix plan { displayName shopifyPlus  }}}` // displayName is deprecated but not provided alternate field in version 2025-04
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.shop
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getShippingMethods(configObj: ConnectionAuth): Observable<ShopifyShippingZoneGraphQLDto[]> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getShippingMethods
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query {deliveryProfiles(first: 25) {  nodes {profileLocationGroups {  locationGroupZones(first: 50) {nodes {  methodDefinitions(first: 100) {nodes {  id  name}  }}  }}  }}}`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.deliveryProfiles?.nodes
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  calculateRefund(
    connectionAuth: ConnectionAuth,
    data: {
      customerOrderId: ShopifyGraphQLId<'Order'>
      refundDto: ShopifyCalculateRefundGraphQLDto
    }
  ): Observable<ShopifyCalculateRefundResponseGraphQLDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        connectionAuth,
        EShopifyGraphQLQueryCost.calculateRefund
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `
                query calculateRefund(
                  $id: ID!
                  $refundLineItems: [RefundLineItemInput!]
                  $isRefundShipping: Boolean
                ) {
                  order(id: $id) {
                    suggestedRefund(
                      refundLineItems: $refundLineItems
                      refundShipping: $isRefundShipping
                    ) {
                      shipping {
                        amountSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                          presentmentMoney {
                            amount
                            currencyCode
                          }
                        }
                        taxSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                          presentmentMoney {
                            amount
                            currencyCode
                          }
                        }
                      }
                      suggestedTransactions {
                        amountSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                          presentmentMoney {
                            amount
                            currencyCode
                          }
                        }
                        gateway
                        kind
                        parentTransaction {
                          id
                        }
                      }
                      totalCartDiscountAmountSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                        presentmentMoney {
                          amount
                          currencyCode
                        }
                      }
                      refundLineItems {
                        lineItem {
                          id
                        }
                        location {
                          id
                        }
                        quantity
                        restockType
                        priceSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                          presentmentMoney {
                            amount
                            currencyCode
                          }
                        }
                        subtotalSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                          presentmentMoney {
                            amount
                            currencyCode
                          }
                        }
                        totalTaxSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                          presentmentMoney {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              `,
              variables: {
                id: data.customerOrderId,
                refundLineItems: data.refundDto.refundLineItems,
                isRefundShipping: data.refundDto.shipping.isRefundShipping
              }
            },
            { ...this.getConfig(connectionAuth) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    connectionAuth.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.order?.suggestedRefund
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  createRefund(
    connectionAuth: ConnectionAuth,
    data: ShopifyCreateRefundGraphQLDto
  ): Observable<ShopifyCreateRefundResponseGraphQLDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        connectionAuth,
        EShopifyGraphQLQueryCost.createRefund
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `
              mutation refundCreate($input: RefundInput!) {
                refundCreate(input: $input) {
                  userErrors {
                    field
                    message
                  }
                  refund {
                    id
                  }
                }
            }
              `,
              variables: {
                input: data
              }
            },
            { ...this.getConfig(connectionAuth) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    connectionAuth.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.refundCreate?.refund
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getFulfillmentOrdersMetaInfo(
    configObj: ConnectionAuth,
    data: { nextPage: PageInfoDto | undefined; query: QueryFulfillmentOrderMetaInfoDto }
  ): Observable<{
    pageInfo: PageInfoDto
    fulfillmentOrderMetaInfo: ShopifyFulfillmentOrdersMetaInfoGraphQlDto[]
  }> {
    const condition = [`first:${data.query.limit}`]
    const query = [`${data.query.fulfillmentOrdersIds}`]
    if (data.nextPage?.hasNextPage) {
      condition.push(`after:"${data.nextPage?.endCursor}"`)
    }
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getFulfillmentOrdersMetaInfo
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { fulfillmentOrders(${condition.join(', ')}, query: "${query.join(' AND ')}"){ nodes{  id  orderId  order{  id  legacyResourceId  } lineItems(first:250){ nodes{ id lineItem {id} } } } pageInfo{  hasNextPage  endCursor } }}`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return {
                pageInfo: response.data?.data?.fulfillmentOrders?.pageInfo,
                fulfillmentOrderMetaInfo: response.data?.data?.fulfillmentOrders?.nodes
              }
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getAssignedFulfillmentOrdersList(
    configObj: ConnectionAuth,
    data: { nextPage: PageInfoDto | undefined; query: QueryShopifyGetOrderDto }
  ): Observable<{ pageInfo: PageInfoDto; fulfillmentOrders: ShopifyFulfillmentOrderGraphQLDto[] }> {
    const condition = [
      `assignmentStatus:${data.query.assignmentStatus}`,
      `first:${data.query.limit}`,
      `locationIds:"${data.query.locationId}"`
    ]
    if (data.nextPage?.hasNextPage) {
      condition.push(`after:"${data.nextPage?.endCursor}"`)
    }
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getAssignedFulfillmentOrdersList
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `query { assignedFulfillmentOrders(${condition.join(', ')} ){ nodes {id orderId updatedAt assignedLocation{    location{  id  legacyResourceId    }}requestStatus status lineItems(first:250){    nodes{  id  lineItem{      id  }  inventoryItemId  totalQuantity  variant{  id inventoryItem { tracked }  }    }}destination{    firstName    email    lastName    address1    address2    company    zip    city    province    countryCode    phone}supportedActions{    action}order{  id  legacyResourceId  name sourceName totalPriceSet{      shopMoney{  amount      }  }  totalTaxSet{      shopMoney{  amount      }  }  currencyCode  shippingAddress{      firstName      lastName      address1      address2      company      zip      city      province      countryCodeV2      phone  }  customer{ defaultEmailAddress { emailAddress }  }  paymentGatewayNames  lineItems(first:250){      nodes{  id  sku  originalUnitPriceSet{   shopMoney{      amount  }  }  quantity  taxLines{  rate  priceSet{      shopMoney{  amount      }  }  }  discountAllocations{  allocatedAmountSet{      shopMoney{  amount      }  }  }      }  }  createdAt  shippingLines(first:250){      nodes{  code discountedPriceSet{ shopMoney {amount}} taxLines{  rate  priceSet{      shopMoney{  amount      }  }  }  }  }  billingAddress{      firstName      lastName      address1      address2      company      zip      city      province      countryCodeV2      phone  }  taxesIncluded  totalDiscountsSet{      shopMoney{  amount      }  }  totalShippingPriceSet{      shopMoney{  amount      }  }  taxLines{      rate      priceSet{  shopMoney{  amount  }      }  }  displayFinancialStatus    }    }    pageInfo { hasNextPage endCursor     } } }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return {
                pageInfo: response.data?.data?.assignedFulfillmentOrders?.pageInfo,
                fulfillmentOrders: response.data?.data?.assignedFulfillmentOrders?.nodes
              }
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  getFulfillmentOrder(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder> }
  ): Observable<ShopifyFulfillmentOrderDetailsGraphQLDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.getFulfillmentOrderDetails
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `
                query {
                  fulfillmentOrder(id: "${data.fulfillmentOrderId}"){
                    id
                    orderId
                    status
                    requestStatus
                    supportedActions {
                        action
                    }
                  }
              }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data.extensions.cost.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.fulfillmentOrder
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  sendCancellationRequestToFulfillmentService(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder> }
  ): Observable<ShopifyFulfillmentOrderDetailsGraphQLDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.sendCancellationRequestToFulfillmentService
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `
              mutation {
                  fulfillmentOrderSubmitCancellationRequest(id: "${data.fulfillmentOrderId}") { fulfillmentOrder { 
                    id
                    orderId
                    status
                    requestStatus
                    supportedActions {
                      action
                    }
                  } 
                  userErrors { field message }
                }
              }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.fulfillmentOrderSubmitCancellationRequest
                ?.fulfillmentOrder
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  cancelFulfillmentOrder(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder> }
  ): Observable<ShopifyFulfillmentOrderDetailsGraphQLDto> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.cancelFulfillmentOrder
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `
              mutation { 
                fulfillmentOrderCancel(id: "${data.fulfillmentOrderId}") { 
                  fulfillmentOrder { 
                    id
                    orderId
                    status
                    requestStatus
                    supportedActions {
                      action
                    }
                  } 
                  userErrors{ field message }
                }
              }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.fulfillmentOrderCancel?.fulfillmentOrder
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  cancelOrder(
    configObj: ConnectionAuth,
    data: {
      orderId: ShopifyGraphQLId<ShopifyResources.Order>
      reason: ShopifyOrderCancelReason
      notifyCustomer: boolean
      isRefund: boolean
      isRestock: boolean
    }
  ): Observable<void> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.cancelOrder
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `
              mutation { 
                orderCancel(orderId: "${data.orderId}", notifyCustomer: ${data.notifyCustomer}, restock: ${data.isRestock}, reason: ${data.reason}, refund: ${data.isRefund}) {
                  orderCancelUserErrors{ field message }
                }
              }`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  acceptFulfillment(
    configObj: ConnectionAuth,
    data: { fulfillmentOrderGId: string }
  ): Observable<Pick<ShopifyFulfillmentOrderGraphQLDto, 'id' | 'orderId'>> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.acceptFulfillment
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation {fulfillmentOrderAcceptFulfillmentRequest(id: "${data.fulfillmentOrderGId}"){ fulfillmentOrder{  id  orderId } userErrors{  field  message }}}`
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.fulfillmentOrderAcceptFulfillmentRequest?.fulfillmentOrder
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }

  createFulfillment(
    configObj: ConnectionAuth,
    data: { shopShipmentDto: ShopifyShipmentGraphQLDto }
  ): Observable<Pick<ShopifyFulfillmentOrderGraphQLDto, 'id' | 'legacyResourceId'>> {
    return from(
      this.rateLimitUtil.handleShopifyGraphQLRateLimit(
        configObj,
        EShopifyGraphQLQueryCost.createFulfillment
      )
    ).pipe(
      concatMap((isConfigured) => {
        return this.http
          .post(
            ShopifyConfigService.getEndpoint('GraphQL'),
            {
              query: `mutation fulfillmentCreate($input: FulfillmentInput!){  fulfillmentCreate(fulfillment: $input){  fulfillment{  id  legacyResourceId  }  userErrors{  field  message  }  }}`,
              variables: {
                input: data.shopShipmentDto
              }
            },
            { ...this.getConfig(configObj) }
          )
          .pipe(
            map((response) => {
              if (!isConfigured) {
                this.rateLimitUtil
                  .setShopifyGraphQLConfigToRedis(
                    configObj.implementationId,
                    response.data?.extensions?.cost?.throttleStatus
                  )
                  .catch((error) => {
                    throw error
                  })
              }
              return response.data?.data?.fulfillmentCreate?.fulfillment
            }),
            catchError((error) => {
              this.catchGraphQLError(error)
            })
          )
      })
    )
  }
}
