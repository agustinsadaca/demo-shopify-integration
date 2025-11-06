import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyResources } from '../../../core/types/common.types'
import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { lastValueFrom } from 'rxjs'
import { ConnectionAuth } from '../../../connection-auths/entities/connection-auth.entity'
import {
  EShopifyFulfillmentOrderStatus,
  EShopifyRequestStatus,
  ShopifyFulfillmentOrderGraphQLDto
} from '../dtos/shopify-fulfillment-order.dto'
import { ShopifyOrderGraphQLDto } from '../dtos/shopify-order.dto'
import { GraphQLShopifyService } from '../graphql-shopify.service'

@Injectable()
export class ShopifyListener {
  private readonly logger = new Logger(ShopifyListener.name)
  constructor(private graphQLShopifyService: GraphQLShopifyService) {}

  @OnEvent('shopify.reject_fulfillment_request') // TODO need to refactor according to graphQL migration
  async cancelFulfillmentOrdersWithNotAllowedFinancialStatus(event: {
    notPaidOrNotPartiallyRefundedOrders: ShopifyOrderGraphQLDto[]
    fulfillmentOrders: ShopifyFulfillmentOrderGraphQLDto[]
    configObj: ConnectionAuth
  }) {
    try {
      const orders = event.notPaidOrNotPartiallyRefundedOrders
      const fulfillmentOrders = event.fulfillmentOrders

      let fulfillmentOrdersToBeCancelled: ShopifyFulfillmentOrderGraphQLDto[] = []
      let orderIdSet: Set<string> = new Set()

      for (const order of orders) {
        orderIdSet.add(order.id)
      }

      if (orderIdSet.size === 0) {
        return Promise.resolve()
      }

      for (const fulfillmentOrder of fulfillmentOrders) {
        if (orderIdSet.has(fulfillmentOrder.orderId)) {
          fulfillmentOrdersToBeCancelled.push(fulfillmentOrder)
        }
      }

      for (const fulfillmentOrder of fulfillmentOrdersToBeCancelled) {
        await this.cancelFulfillmentOrderUsingFulfillmentDetails(
          event.configObj,
          fulfillmentOrder,
          fulfillmentOrder.id
        )
      }
    } catch (err) {
      this.logger.error(err, err?.stack)
    }
  }

  async cancelFulfillmentOrderUsingFulfillmentDetails(
    connectionAuth: ConnectionAuth,
    fulfillmentOrderDetails: ShopifyFulfillmentOrderGraphQLDto,
    fulfillmentOrderId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
  ) {
    try {
      if (
        fulfillmentOrderDetails.requestStatus === EShopifyRequestStatus.ACCEPTED &&
        fulfillmentOrderDetails.status === EShopifyFulfillmentOrderStatus.IN_PROGRESS
      ) {
        await lastValueFrom(
          this.graphQLShopifyService.sendCancellationRequestToFulfillmentService(connectionAuth, {
            fulfillmentOrderId
          })
        )
      }

      const fulfillmentOrder = await lastValueFrom(
        this.graphQLShopifyService.cancelFulfillmentOrder(connectionAuth, {
          fulfillmentOrderId
        })
      )

      this.logger.log(
        `Successfully cancelled fulfillment order for fulfillmentId ${fulfillmentOrderId}`
      )

      return fulfillmentOrder
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }
}
