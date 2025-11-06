import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyResources } from '../../../core/types/common.types'
import { PickType } from '@nestjs/swagger'
import { SupportedActionsEnum } from '../enums/supported-actions.enum'
import {
  ShopifyFulfillmentOrderLineItemDto,
  ShopifyFulfillmentOrderLineItemGraphQLDto
} from './shopify-fulfillment-order-line-item.dto'
import { ShopifyOrderGraphQLDto } from './shopify-order.dto'
import {
  ShopifyDestinationAddressGraphQLDto,
  ShopifyShippingAddressDto
} from './shopify-shipping-address.dto'

export type ShopifyRequestStatus =
  | 'unsubmitted'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'cancellation_requested'
  | 'cancellation_accepted'
  | 'cancellation_rejected'
  | 'closed'
export type ShopifyFulfillmentOrderStatus = 'open' | 'closed' | 'in_progress'

export class ShopifyFulfillmentOrderDto {
  id: number
  shop_id: number
  order_id: number
  assigned_location_id: number
  request_status: ShopifyRequestStatus
  status: ShopifyFulfillmentOrderStatus
  line_items: ShopifyFulfillmentOrderLineItemDto[]
  destination: ShopifyShippingAddressDto
  outgoing_requests?: ShopifyMerchantRequestsDto[]
  supported_actions: Array<SupportedActionsEnum>
}

export class ShopifyFulfillmentOrderGraphQLDto {
  id: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
  legacyResourceId?: string
  orderId: ShopifyGraphQLId<ShopifyResources.Order>
  legacyResourceIdOrderId?: string
  assignedLocation: {
    location: {
      id: ShopifyGraphQLId<ShopifyResources.Location>
      legacyResourceId: string
    }
  }
  requestStatus: EShopifyRequestStatus
  status: EShopifyFulfillmentOrderStatus
  lineItems: { nodes: ShopifyFulfillmentOrderLineItemGraphQLDto[] }
  destination: ShopifyDestinationAddressGraphQLDto
  // outgoing_requests?: ShopifyMerchantRequestsDto[] // TODO need to find alternative
  supportedActions: {
    action: EShopifyFulfillmentSupportedActions
  }[]
  order?: ShopifyOrderGraphQLDto
}

export class ShopifyFulfillmentOrderDetailsGraphQLDto extends PickType(
  ShopifyFulfillmentOrderGraphQLDto,
  ['id', 'orderId', 'requestStatus', 'status', 'supportedActions']
) {}

export class ShopifyMerchantRequestsDto {
  request_options: {
    notify_customer: boolean
  }
}

export enum EShopifyRequestStatus {
  ACCEPTED = 'ACCEPTED',
  CANCELLATION_ACCEPTED = 'CANCELLATION_ACCEPTED',
  CANCELLATION_REJECTED = 'CANCELLATION_REJECTED',
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  SUBMITTED = 'SUBMITTED',
  UNSUBMITTED = 'UNSUBMITTED'
}

export enum EShopifyFulfillmentOrderStatus {
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
  INCOMPLETE = 'INCOMPLETE',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  OPEN = 'OPEN',
  SCHEDULED = 'SCHEDULED'
}

export enum EShopifyFulfillmentSupportedActions {
  CANCEL_FULFILLMENT_ORDER = 'CANCEL_FULFILLMENT_ORDER',
  CREATE_FULFILLMENT = 'CREATE_FULFILLMENT',
  EXTERNAL = 'EXTERNAL',
  HOLD = 'HOLD',
  MARK_AS_OPEN = 'MARK_AS_OPEN',
  MERGE = 'MERGE',
  MOVE = 'MOVE',
  RELEASE_HOLD = 'RELEASE_HOLD',
  REQUEST_CANCELLATION = 'REQUEST_CANCELLATION',
  REQUEST_FULFILLMENT = 'REQUEST_FULFILLMENT',
  SPLIT = 'SPLIT'
}

export class ShopifyFulfillmentOrdersMetaInfoGraphQlDto {
  id: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
  orderId: ShopifyGraphQLId<ShopifyResources.Order>
  order: {
    id: ShopifyGraphQLId<ShopifyResources.Order>
    legacyResourceId: string
  }
  lineItems: {
    nodes: {
      id: ShopifyGraphQLId<ShopifyResources.FulfillmentOrderLineItem>
      lineItem: {
        id: ShopifyGraphQLId<ShopifyResources.LineItem>
      }
    }[]
  }
}
