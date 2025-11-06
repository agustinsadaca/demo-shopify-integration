import { OrgType } from '../../shop-connectors/shopify/entities/enums.entity'

export interface RoutedMessage<T = any> {
  implementationId: number
  targetTypeId: number
  target: OrgType
  entity?: string
  action?: string
  data?: T
  retryCount?: number
  maxAllowedRetry?: number
  retryEventId?: number
}
