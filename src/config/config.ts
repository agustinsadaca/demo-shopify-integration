import { JestPactOptionsV3 } from 'jest-pact/dist/v3'

const demo_shopify_connector_db_local = {
  host: 'localhost',
  username: 'demo-shopify-integration',
  database: 'demo-shopify-integration',
  password: 'demo-shopify-integration',
  port: 5432
}
const nos_local_url = 'http://staging.warehousing1.com/api/v1/demo_shopify_email/send_mail'

process.env.stage = process.env.stage || 'local'

const SIX_HOURS_IN_MILLISECONDS = 1000 * 60 * 60 * 6
const EIGHT_HOURS_IN_MILLISECONDS = 1000 * 60 * 60 * 8
const TWENTY_FOUR_HOURS_IN_MILLISECONDS = 1000 * 60 * 60 * 24
const TEN_DAYS_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 10
const ONE_MB_IN_BYTES = 1000000

export const mainConfigs = {
  postgres:
    process.env.stage != 'local'
      ? JSON.parse(process.env[`demo_shopify_connector_db_${process.env.stage}`] || '{}')
      : demo_shopify_connector_db_local,
  URL: process.env.URL || '',
  maxAllowedFileSize: ONE_MB_IN_BYTES, // in bytes
  aws_api_version: '2016-04-18',
  shopPerPageLimit: 50,
  billbeeMaxLimitPerPage: 250,
  shopProductsPageLimit: 20,
  shopOrdersPageLimit: 90,
  maxAllowedRetry: 5,
  orderMaxAllowedRetry: 35,
  inventoryLevelMaxAllowedRetry: 3,
  retryFrequencyIncrementThreshold: 5,
  lowStockFrequencyInHours: 24,
  dhlTrackingCodeQueryLimitPerRequest: 15,
  defaultLanguageForCountriesList: 'en',
  redis: {
    b2cTokenExpiresInSeconds: 7200
  },
  wipFileDuration: 1000 * 60 * 60 * 2,
  jtlEntityIdsFilterLimit: 15,
  appEnv: process.env.stage,
  defaultPayloadBatchSize: 20,
  middlewarePayloadBatchSizePlii: 50,
  middlewarePayloadBatchSizeShipment: 20,
  rateLimit: {
    default: {
      allowedRequest: 2,
      ttlInSeconds: 1
    },
    dhl: {
      ttlInSeconds: 5.5
    }
  },
  moreThanCreatedAtTimeForTrackingForStatus: {
    shipped: EIGHT_HOURS_IN_MILLISECONDS,
    inDelivery: TWENTY_FOUR_HOURS_IN_MILLISECONDS
  },
  moreThanUpdatedAtTimeForTrackingForStatus: {
    delivered: TEN_DAYS_IN_MILLISECONDS
  },
  dhlTrackingRequestBatchSize: 5,
  moreThanCreatedAtTimeForTrackingOfReturnRequest: SIX_HOURS_IN_MILLISECONDS,
  defaultDelayOrderReleaseInMinutes: 5,
  PVSPartnerId: 11,
  DataformPartnerId: 3,
  addressValidationSupportedCountries: [
    'AR',
    'AT',
    'AU',
    'BE',
    'BG',
    'BR',
    'CA',
    'CH',
    'CL',
    'CO',
    'CZ',
    'DE',
    'DK',
    'EE',
    'ES',
    'FI',
    'FR',
    'GB',
    'HR',
    'HU',
    'IE',
    'IN',
    'IT',
    'LT',
    'LU',
    'LV',
    'MX',
    'MY',
    'NL',
    'NO',
    'NZ',
    'PL',
    'PR',
    'PT',
    'SE',
    'SG',
    'SI',
    'SK',
    'US'
  ],
  addressValidationAlgorithmV2SupportedCountries: ['DE', 'AT'],
  cloudflareInfo: {
    demoShopifyZoneId: 'b426073eec343e865b0a4fefb280a996',
    cpMainDomain: 'cp.demo-shopify.plus',
    demoShopifyDomain: 'demo-shopify.plus'
  },
  /**
   * list of implementation ids for which we should ignore DHL tracking
   *
   * implementation id `16` is for Demo purpose
   */
  ignoreDHLTrackingForImplementationIds: [16],
  dhlConnectionURL: 'https://api-eu.dhl.com',
  isUnleashEnabled: true
}

const TWO_DAYS = new Date().getTime() + 48 * 60 * 60 * 1000
const reportsBucketSuffix = process.env.stage === 'prod' ? 'prod' : 'staging'
export const reportGenerator = {
  bucket: `demo-shopify-reports-${reportsBucketSuffix}`,
  signedUrlExpiresInSeconds: 3600 * 48,
  totalRecordCount: 200,
  expirationTime: new Date(TWO_DAYS),
  contentType: 'application/zip'
}

const kafka_broker_local = ['localhost:9092']

export const kafka_broker =
  process.env.stage != 'local'
    ? process.env[`demo_shopify_kafka_broker_${process.env.stage}`]?.split(',')!
    : kafka_broker_local

export const nosUrl = process.env.stage != 'local' ? process.env.nos_url : nos_local_url

export const pactConsumerConfig: JestPactOptionsV3 = {
  consumer: 'Connector Consumer',
  provider: 'Middleware Provider',
  port: 4000,
  logLevel: 'error'
}

export const ticketAttachmentConfig = {
  bucket: `demo-shopify-simple-control-assets`,
  basePath: `${process.env.stage === 'prod' ? 'prod' : 'staging'}/tickets`,
  signedUrlExpiresInSeconds: 60 * 5, // 5 minutes
  attachmentSizeLimit: 1024 * 1024 * 15, // 15 MB limit
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/heic',
    'video/mp4',
    'video/webm',
    'video/mpeg',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-tar'
  ]
}
