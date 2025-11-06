/**
 * Enum representing the different kinds of suggested order transactions.
 */
export enum SuggestedOrderTransactionKind {
  /**
   * An amount reserved against the cardholder's funding source. Money does not change hands until the authorization is captured.
   */
  AUTHORIZATION = 'AUTHORIZATION',

  /**
   * A transfer of the money that was reserved by an authorization.
   */
  CAPTURE = 'CAPTURE',

  /**
   * The money returned to the customer when they've paid too much during a cash transaction.
   */
  CHANGE = 'CHANGE',

  /**
   * An authorization for a payment taken with an EMV credit card reader.
   */
  EMV_AUTHORIZATION = 'EMV_AUTHORIZATION',

  /**
   * A partial or full return of captured funds to the cardholder. A refund can happen only after a capture is processed.
   */
  REFUND = 'REFUND',

  /**
   * An authorization and capture performed together in a single step.
   */
  SALE = 'SALE',

  /**
   * A suggested refund transaction that can be used to create a refund.
   */
  SUGGESTED_REFUND = 'SUGGESTED_REFUND',

  /**
   * A cancellation of an authorization transaction.
   */
  VOID = 'VOID'
}
