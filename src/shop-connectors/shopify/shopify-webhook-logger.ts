import pino from 'pino'
import * as pinoElastic from 'pino-elasticsearch'

let shopifyWebhookLogger = pino()

if (process.env.stage && process.env.stage !== 'local') {
  const esCredsJson = JSON.parse(process.env.ES_CREDS_JSON)
  const streamToElastic = pinoElastic.default({
    index: `<shopify-demo-${process.env.stage}-webhook-{now/M}>`,
    node: esCredsJson.ES_HOST,
    auth: {
      username: esCredsJson.ES_USER,
      password: esCredsJson.ES_PASSWORD
    }
  })

  const multistreams = pino.multistream([{ stream: process.stdout }, { stream: streamToElastic }])

  // Listen for errors on the stream
  streamToElastic.on('error', (err) => {
    console.error('Shopify webhook: Error sending log to Elasticsearch:', err)
  })

  // add a hanlder for unknown
  streamToElastic.on('unknown', (line, error) => {
    console.error('Shopify webhook: Unknown line encountered:', line, error)
  })

  // insertError
  streamToElastic.on('insertError', (error) => {
    console.error('Shopify webhook: Error inserting into Elasticsearch:', error)
  })

  shopifyWebhookLogger = pino({}, multistreams)
}

export default shopifyWebhookLogger
