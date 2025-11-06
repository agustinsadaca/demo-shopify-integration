import { RoutedMessage } from '../event-handlers/interfaces/routed-message.interface'

export interface ShopConnectorsServiceInterface {
  getOrders?(message: RoutedMessage): Promise<any>
  getInventoryItems?(message: RoutedMessage): Promise<any>
  createShipments?(message: RoutedMessage): Promise<any>
  updateInventoryLevels?(message: RoutedMessage): Promise<any>
  updateCancelledOrders?(message: RoutedMessage): Promise<any>
  updateOpenedOrders?(message: RoutedMessage): Promise<any>
  createReturnShipments?(message: RoutedMessage): Promise<any>
  createRefundOrders?(message: RoutedMessage): Promise<any>
  getShopDetails?(message: RoutedMessage): Promise<any>
  getShippingMethod?(queryFieldMapper: any): Promise<any>
  getInventoryItemShopStockLevels?(inventoryItem: any, connection: any): Promise<any>
  setConnection?(connectionAuth: any): Promise<void>
  createRefundOrder?(refundOrderDto: any, flag?: boolean): Promise<any>
  calculateRefundOrder?(refundOrderDto: any, calculateRefundOrderResponse?: any): Promise<any>
  sendOrdersToMiddleware?(orders: any, message: any): Promise<any>
  sendInventoryItemsToMiddleware?(inventoryItems: any, message: any, param3?: any, param4?: any): Promise<any>
}
