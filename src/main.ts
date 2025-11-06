// ---------------------KEEP AT THE TOP------------------------
import './core/utils/sentry.instrument'
import { initializeAPMAgent } from './elastic-apm/apm.util'
if (process.env.stage && process.env.stage !== 'local') {
  initializeAPMAgent({
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    serverUrl: process.env.ELASTIC_APM_SERVER_URL
  })
}
// ------------------------------------------------------------
import { Logger as AppLogger } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { urlencoded } from 'express'
import { Logger } from 'nestjs-pino'
import { AdminModule } from './admin/admin.module'
import { AppModule } from './app.module'
import { AuthModule } from './auth/auth.module'
import JwtAuthGuard from './auth/jwt-auth.guard'
import { B2cModule } from './b2c/b2c.module'
import { ConfigService } from './config.service'
import { CommonResponseInterceptor } from './core/common-response.interceptor'
import { ShopModule } from './shop/shop.module'

import * as Sentry from '@sentry/nestjs'

global['fetch'] = require('node-fetch')

const appLogger = new AppLogger('Application Bootstrap')
process.on('warning', (warning: Error) => {
  appLogger.error({ type: 'warning' })
  appLogger.error(warning?.message, warning?.stack)
  Sentry.captureException(warning)
})

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  appLogger.error({ type: 'unhandledRejection' }, reason)
  Sentry.captureException(reason)
})

process.on('uncaughtException', (error: Error) => {
  appLogger.error({ type: 'uncaughtException' })
  appLogger.error(error?.message, error?.stack)
  Sentry.captureException(error)
})

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule, { bufferLogs: true })
  app.enableShutdownHooks()

  app.use(urlencoded({ extended: true }))
  app.set('query parser', 'extended')
  app.useLogger(app.get(Logger))

  if (ConfigService.isKafkaEnabled()) {
    app.connectMicroservice<MicroserviceOptions>(ConfigService.kafkaConfig())
    await app.startAllMicroservices()
  }

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })

  app.useGlobalInterceptors(new CommonResponseInterceptor())
  app.disable('x-powered-by')

  const reflector = app.get(Reflector)
  app.useGlobalGuards(new JwtAuthGuard(reflector))

  const descriptionWms = `Demo Shopify API Documentation
    <p>
      <strong>wms-json: <strong>
      <a href="/wms-json" target="_blank">click here</a>
    </p>
  `

  const configWms = new DocumentBuilder()
    .setTitle('Demo Shopify WMS API')
    .setDescription(descriptionWms)
    .setVersion(process.env.npm_package_version!)
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization'
    )
    .build()

  const wmsDocument = SwaggerModule.createDocument(app, configWms, {
    include: [ AuthModule]
  })

  const swaggerCustomCss: string = `svg {display: none} .swagger-ui .topbar { background-color: #fafafa;} .topbar-wrapper {content:url(\'https://d1hy0tp7pfir2x.cloudfront.net/warehousing-plus-logo-20210414.png\'); width:150px; height:auto;} .swagger-ui .info { margin: 10px 0 }`
  SwaggerModule.setup('wms', app, wmsDocument, {
    customSiteTitle: 'Demo Shopify WMS API Documentation',
    customCss: swaggerCustomCss,
    customfavIcon: 'https://d1hy0tp7pfir2x.cloudfront.net/wh-favicon.png'
  })

  const descriptionShop = `Demo Shopify API Documentation
    <p>
      <strong>shop-json: <strong>
      <a href="/shop-json" target="_blank">click here</a>
    </p>
  `

  const configShop = new DocumentBuilder()
    .setTitle('Demo Shopify Shop API')
    .setDescription(descriptionShop)
    .setVersion(process.env.npm_package_version!)
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization'
    )
    .build()

  const shopDocument = SwaggerModule.createDocument(app, configShop, {
    include: [ShopModule, AuthModule]
  })

  SwaggerModule.setup('shop', app, shopDocument, {
    customSiteTitle: 'Demo Shopify SHOP API Documentation',
    customCss: swaggerCustomCss,
    customfavIcon: 'https://d1hy0tp7pfir2x.cloudfront.net/wh-favicon.png'
  })

  const descriptionAdmin = `Demo Shopify API Documentation
    <p>
      <strong>admin-json: <strong>
      <a href="/admin-json" target="_blank">click here</a>
    </p>
  `

  const configAdmin = new DocumentBuilder()
    .setTitle('Demo Shopify Admin API')
    .setDescription(descriptionAdmin)
    .setVersion(process.env.npm_package_version!)
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization'
    )
    .build()

  const adminDocument = SwaggerModule.createDocument(app, configAdmin, {
    include: [AdminModule, AuthModule]
  })

  SwaggerModule.setup('admin', app, adminDocument, {
    customSiteTitle: 'Demo Shopify Admin API Documentation',
    customCss: swaggerCustomCss,
    customfavIcon: 'https://d1hy0tp7pfir2x.cloudfront.net/wh-favicon.png'
  })

  const descriptionB2c = `Demo Shopify B2C API Documentation
    <p>
      <strong>b2c-json: <strong>
      <a href="/b2c-json" target="_blank">click here</a>
    </p>
  `

  const configB2c = new DocumentBuilder()
    .setTitle('Demo Shopify B2C API')
    .setDescription(descriptionB2c)
    .setVersion(process.env.npm_package_version!)
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization'
    )
    .build()

  const b2cDocument = SwaggerModule.createDocument(app, configB2c, {
    include: [B2cModule]
  })

  SwaggerModule.setup('b2c', app, b2cDocument, {
    customSiteTitle: 'Demo Shopify B2C API Documentation',
    customCss: swaggerCustomCss,
    customfavIcon: 'https://d1hy0tp7pfir2x.cloudfront.net/wh-favicon.png'
  })

  await app.listen(3000)
}

bootstrap()
