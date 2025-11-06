import { Role, EntityEnum, TargetSystemEnum, OrgType } from '../../shop-connectors/shopify/entities/enums.entity'

// Re-export for convenience
export { EntityEnum, TargetSystemEnum, OrgType, Role }

// User types
export interface JwtUser {
  id: number
  email: string
  role: Role
  entityRole?: Role
  entityId?: number
  implementationId: number
  implementationIds?: string
  organizationId?: number
}

// Pagination types
export class PaginatorDto {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface IPaginationOptions {
  page: number
  limit: number
  paginationType?: PaginationTypeEnum
  countQueryType?: CountQueryTypeEnum
}

export enum CountQueryTypeEnum {
  TOTAL = 'TOTAL',
  FILTERED = 'FILTERED',
  ENTITY = 'ENTITY'
}

export enum PaginationTypeEnum {
  LIMIT_AND_OFFSET = 'limit_and_offset',
  TAKE_AND_SKIP = 'take_and_skip'
}

export interface Pagination<T> {
  items: T[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export function paginate<T>(
  queryBuilder: any,
  options: IPaginationOptions
): Promise<Pagination<T>> {
  // Mock implementation - replace with actual pagination logic if needed
  return Promise.resolve({
    items: [],
    meta: {
      totalItems: 0,
      itemCount: 0,
      itemsPerPage: options.limit,
      totalPages: 0,
      currentPage: options.page
    }
  })
}

// Shopify specific types
export type ShopifyGraphQLId<T = any> = string

export enum ShopifyResources {
  Order = 'Order',
  Product = 'Product',
  Customer = 'Customer',
  FulfillmentOrder = 'FulfillmentOrder',
  FulfillmentOrderLineItem = 'FulfillmentOrderLineItem',
  LineItem = 'LineItem',
  InventoryItem = 'InventoryItem',
  Location = 'Location'
}

// Additional types for Shopify integration
export interface Dimension {
  length?: number
  width?: number
  height?: number
  weight?: number
  weightUnit?: string
}

export interface CreateReturnShipmentDto {
  orderId?: number
  returnShipmentItems?: any[]
  returnShipmentHistories?: any
  // Add properties as needed
  [key: string]: any
}

export interface ReturnShipment {
  id?: number
  returnShipmentItems?: any[]
  // Add properties as needed
  [key: string]: any
}

export interface ReturnShipmentItem {
  id?: number
  // Add properties as needed
  [key: string]: any
}

export interface CreatePartnerLocationInventoryItemDto {
  // Add properties as needed
  [key: string]: any
}

export interface OutboundShipment {
  id?: number
  orderId?: number
  outboundShipmentItems?: OutboundShipmentItem[]
  // Add properties as needed
  [key: string]: any
}

export interface OutboundShipmentItem {
  id?: number
  // Add properties as needed
  [key: string]: any
}

export interface OrderHistory {
  id?: number
  // Add properties as needed
  [key: string]: any
}

export interface CreateOrdersHistoryDto {
  shopCreatedAt?: Date
  shopUpdatedAt?: Date
  wmsCreatedAt?: Date
  // Add properties as needed
  [key: string]: any
}

export interface CalculateRefundOrderDto {
  orderId: number
  // Add properties as needed
  [key: string]: any
}

export interface CalculateRefundOrderResponseDto {
  // Add properties as needed
  [key: string]: any
}

export interface RefundOrderItem {
  id?: number
  // Add properties as needed
  [key: string]: any
}

// Return request types
export interface ReturnRequest {
  id?: number
  status?: ReturnRequestStatus
  // Add other properties as needed
  [key: string]: any
}

export enum ReturnRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

// Order types
export interface Order {
  id: number
  customerOrderNumber?: string
  orderItems?: OrderItem[]
  metaInfo?: any
  channel?: string
  billingCountryCodeIso?: string
  billingPhone?: string
  shippingCountryCodeIso?: string
  shippingPhone?: string
  // Add other properties as needed - flexible for demo
  [key: string]: any
}

export interface OrderItem {
  id?: number
  orderId?: number
  quantity?: number
  inventoryItemSku?: string
  customerLineItemId?: string
  pricePaid?: number
  pricePaidNet?: number
  unitPrice?: number
  taxRate?: number
  taxAmount?: number
  discount?: number
  discountTaxRate?: number
  metaInfo?: any
  // Add other properties as needed - flexible for demo
  [key: string]: any
}

export interface ExtendedOrderDto extends Order {
  // Add extended properties as needed
}

// Inventory types
export interface InventoryItem {
  id: number
  sku?: string
  name?: string
  customerItemId?: string
  implementationId?: number
  metaInfo?: any
  countryCodeOfOrigin?: string
  harmonizedSystemCode?: string
  // Add other properties as needed - flexible for demo
  [key: string]: any
}

export interface CreateInventoryItemDto {
  // Add properties as needed
  [key: string]: any
}

export interface CreateOrderDto {
  // Add properties as needed
  [key: string]: any
}

export interface RefundOrder {
  id?: number
  orderId?: number
  implementationId?: number
  [key: string]: any
}

export interface B2cAuthResponseDto {
  [key: string]: any
}

export interface InboundNotice {
  id?: number
  [key: string]: any
}

export { ActionEnum } from '../../shop-connectors/shopify/entities/enums.entity'

export interface UpdateOrdersMetaInfoIsShippingMethodUnknownDto {
  [key: string]: any
}

export interface UpdateInventoryItemDto {
  // Add properties as needed
}

export interface CreatePartnerLocationInventoryItemDto {
  // Add properties as needed
}

export interface UpdatePartnerLocationInventoryItemDto {
  // Add properties as needed
}

export interface UpsertPartnerLocationInventoryItemDto {
  // Add properties as needed
}

// Refund order types
export interface CalculateRefundOrderDto {
  orderId: number
  // Add other properties as needed
}

export interface CalculateRefundOrderResponseDto {
  // Add properties as needed
}

// Inbound types
export interface CreateInboundReceiptDto {
  // Add properties as needed
}

export interface UpdateInboundReceiptItemDto {
  // Add properties as needed
}

// Return steps types
export interface CreateReturnStepsDto {
  // Add properties as needed
}

export interface QueryReturnStepsDto {
  // Add properties as needed
}

export interface UpdateReturnStepsDto {
  // Add properties as needed
}

export interface UpdateReturnRequestDto {
  // Add properties as needed
}

// Query types
export interface QueryInventoryItemDto {
  // Add properties as needed
}

export interface QueryOrderDto {
  // Add properties as needed
}

// B2C Auth types
export interface B2cAuthResponseDto {
  // Add properties as needed
}

// Implementation types
export interface Implementation {
  id: number
  // Add other properties as needed
}
