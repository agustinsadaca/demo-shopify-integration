import { ShopifyGraphQLId } from '../dtos/shopify/shopify-graphql-id'

export interface RefundOrderMetaInfo {
  shopify_refund_gid?: ShopifyGraphQLId<'Refund'>
}
