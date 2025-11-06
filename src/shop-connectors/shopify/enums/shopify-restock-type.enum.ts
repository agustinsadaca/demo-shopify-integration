/**
 * The type of restock for this line item.
 */
export enum ShopifyRestockType {
  /**
   * The refund line item was canceled. Use this when restocking unfulfilled line items.
   */
  CANCEL = 'CANCEL',
  /**
   * Deprecated. The refund line item was restocked, without specifically being identified as a return or cancellation. This value is not accepted when creating new refunds.
   */
  LEGACY_RESTOCK = 'LEGACY_RESTOCK',
  /**
   * Refund line item was not restocked.
   */
  NO_RESTOCK = 'NO_RESTOCK',
  /**
   * The refund line item was returned. Use this when restocking line items that were fulfilled.
   */
  RETURN = 'RETURN'
}
