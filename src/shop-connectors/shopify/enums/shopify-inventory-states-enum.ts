export enum ShopifyInventoryStates {
  /**
   * The total number of units that are physically at a location.

    The on_hand state equals the sum of inventory quantities that are in the `available`, `committed`, `reserved`, `damaged`, `safety_stock`, and `quality_control` states.
   */
  ON_HAND = 'on_hand',
  /**
   * The inventory that a merchant can sell. Available inventory isn’t committed to any orders and isn’t part of incoming transfers.
   */
  AVAILABLE = 'available',
  /**
   * The number of units that are part of a placed order but aren't fulfilled. When a draft order is created, the inventory isn't committed until the draft order is completed and an order is created.
   */
  COMMITTED = 'committed',
  /**
   * The inventory that’s on its way to a merchant's location. For example, the inventory might be in an incoming shipment. Incoming inventory isn’t available to sell until it has been received and its state has been changed to available.

    The `incoming` state is the only state that represents quantities that aren't physically present at a location. Incoming inventory is surfaced at its destination location.
   */
  INCOMING = 'incoming',
  /**
   * The on-hand units that aren't sellable or usable due to damage.

    Inventory quantities in a `damaged` state display as Unavailable to merchants that are tracking inventory in the Shopify admin.
   */
  DAMAGED = 'damaged',
  /**
   * The on-hand units that aren't sellable because they're currently in inspection for quality purposes.

    Inventory quantities in a `quality_control` state display as Unavailable to merchants that are tracking inventory in the Shopify admin.
   */
  QUALITY_CONTROL = 'quality_control',
  /**
   * The on-hand units that are temporarily set aside. For example, a merchant might want to set on-hand units aside for holds or inspection.

    Inventory quantities in a `reserved` state display as Unavailable to merchants that are tracking inventory in the Shopify admin.
   */
  RESERVED = 'reserved',
  /**
   * The on-hand units that are set aside to help guard against overselling.

    Inventory quantities in a `safety_stock` state display as Unavailable to merchants that are tracking inventory in the Shopify admin.
   */
  SAFETY_STOCK = 'safety_stock'
}

export const ShopifyInventoryUnavailableStates = [
  ShopifyInventoryStates.DAMAGED,
  ShopifyInventoryStates.QUALITY_CONTROL,
  ShopifyInventoryStates.RESERVED,
  ShopifyInventoryStates.SAFETY_STOCK
]
