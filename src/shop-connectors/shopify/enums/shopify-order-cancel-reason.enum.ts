export enum ShopifyOrderCancelReason {
  /**
   * The customer wanted to cancel the order.
   */
  CUSTOMER = 'CUSTOMER',

  /**
   * Payment was declined.
   */
  DECLINED = 'DECLINED',

  /**
   * The order was fraudulent.
   */
  FRAUD = 'FRAUD',

  /**
   * There was insufficient inventory.
   */
  INVENTORY = 'INVENTORY',

  /**
   * The order was canceled for an unlisted reason.
   */
  OTHER = 'OTHER',

  /**
   * Staff made an error.
   */
  STAFF = 'STAFF'
}
