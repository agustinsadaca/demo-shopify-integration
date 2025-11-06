import { OrgType } from '@digital-logistics-gmbh/wh1plus-common'
import { DhlCarrierAuth } from '../../../src/carrier-connectors/dhl/dtos/dhl-auth.dto'
import { ConnectionAuth } from '../../../src/connection-auths/entities/connection-auth.entity'
import { ConnectionPoolService } from '../../../src/connection-pool/connection-auth-pool.service'
import { CarrierTargetSystemEnum } from '../../../src/core/enums/carrier-target-system.enums'
import { RoutedMessage } from '../../../src/event-handlers/interfaces/routed-message.interface'
import { MockType } from '../../utils/mock-type'

export const ConnectionPoolServiceMockFactory: () => MockType<ConnectionPoolService> = jest.fn(
  () => ({
    createKeyFromMessage: jest.fn(() => {
      return `pool-key`
    }),
    getConnectionPool: jest.fn((message: RoutedMessage) => {
      let connection: DhlCarrierAuth | ConnectionAuth | null = null

      const carrierAuth = {
        implementationId: 18,
        connectionUrl: 'https://oauth2.jtl-software.com',
        authObject: {
          env: 'sandbox',
          tracking: { dhl_api_key: 'someapikey' },
          return: {
            username: 'prod@org.com',
            password: '',
            dhl_api_key: 'test'
          }
        },
        authStrategy: 'auth2.0',
        isActive: true,
        targetSystem: CarrierTargetSystemEnum.DHL,
        metaInfo: {
          receiverIdObject: {
            in: 'wh1_pvs_be',
            gb: 'wh1_pvs_gb',
            de: 'wh1_deu',
            ch: 'wh1_deu',
            ir: 'wh1_irl'
          }
        }
      } as any as DhlCarrierAuth

      const shopConnectionAuth = {
        id: 3,
        createdAt: '2022-02-08T18:30:00.000Z',
        updatedAt: '2023-07-11T09:20:09.827Z',
        connectionUrl: 'http://3.39.3.2',
        targetType: 'shop',
        targetSystem: 'woocommerce',
        authObject: {
          accessKey: 'accessKey',
          secretKey: 'secretKey'
        },
        authStrategy: 'oauth1.0',
        implementationId: message?.implementationId ?? 1,
        sharedImplementations: null,
        isActive: true,
        targetTypeId: message?.targetTypeId ?? 1,
        targetSystemConnectionId: null,
        metaInfo: {
          shopifyPlan: {
            rateLimit: {
              ttlInSeconds: 1,
              allowedRequest: 2
            },
            planDisplayName: 'Developer Preview'
          },
          shopifyOrderNumberFormat: {
            orderNumberFormatPrefix: '#',
            orderNumberFormatSuffix: ''
          }
        },
        defaultTimezone: null,
        fulfillmentTrain: {
          '3': '0 */5 * * * *'
        }
      } as any as ConnectionAuth

      const wmsConnectionAuth = {
        id: 14,
        createdAt: '2022-04-18T12:55:21.715Z',
        updatedAt: '2023-05-04T13:04:41.165Z',
        connectionUrl: 'data.sigloch.de',
        targetType: 'wms',
        targetSystem: 'sigloch',
        authObject: {
          host: 'data.sigloch.de',
          port: '22',
          basePath: '/Test',
          password: 'hello@wrold',
          username: 'test',
          idleTimeout: 60000
        },
        authStrategy: 'sftp.password',
        implementationId: 4,
        sharedImplementations: [4, 28, 105],
        isActive: true,
        targetTypeId: 1,
        targetSystemConnectionId: 'Sigloch-Test-1',
        metaInfo: {
          subClientInfo: {
            '4': '11111',
            '28': '99997',
            '105': '99996'
          },
          customerId: 'XREF 90019670',
          facilityId: 'XREF 90019670'
        },
        defaultTimezone: null,
        delayOrderReleaseInMinutes: null
      } as any as ConnectionAuth

      switch (message.target) {
        case OrgType.Shop:
          connection = shopConnectionAuth
          break
        case OrgType.Wms:
          connection = wmsConnectionAuth
          break
        case OrgType.Carrier:
          connection = carrierAuth
          break
      }

      return Promise.resolve(connection)
    }),
    setConnectionPool: jest.fn(() => {
      return null
    })
  })
)
