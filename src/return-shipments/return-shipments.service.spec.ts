import { CreateReturnShipmentDto, JwtUser, OrgType, QueryReturnShipmentDto, ReturnShipment, UpdateReturnShipmentDto } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { HttpService } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { HttpServiceMockFactory } from '../../test/mocks/common/http.mock'
import { HttpMiddlewareService } from '../core/http-middleware.service'
import { ReturnShipmentsService } from './return-shipments.service'
import { PinoLogger } from 'nestjs-pino'

describe('ReturnShipmentsService', () => {
  let service: ReturnShipmentsService
  let httpMiddlewareService: HttpMiddlewareService
  let jwtUser: JwtUser

  const returnShipment: ReturnShipment = new ReturnShipment()
  const responseObj = {
    items: [returnShipment],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1
    },
    links: {
      first: "/shop/return-shipments/?limit=10",
      previous: "",
      next: "",
      last: "/shop/return-shipments/?page=1&limit=10"
    }
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnShipmentsService,
        HttpMiddlewareService,
        {
          provide: HttpService, useValue: HttpServiceMockFactory,
        },
        {
          provide: PinoLogger,
          useValue: {
            logger: {
              bindings: jest.fn().mockReturnValue({ requestCorrelationId: 'test-correlation-id' }),
            },
          },
        }
      ],
    }).compile()

    service = module.get<ReturnShipmentsService>(ReturnShipmentsService)
    httpMiddlewareService = module.get<HttpMiddlewareService>(HttpMiddlewareService)
    jwtUser = {
      entityId: 1,
      entityRole: OrgType.Wms,
      implementationIds: '1, 2'
    }
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get return shipment', () => {
    jest.spyOn(httpMiddlewareService, 'getReturnShipment').mockImplementation(() => of(returnShipment))
    service.getReturnShipment(1, jwtUser).subscribe(returnShipmentObj => {
      expect(returnShipmentObj).toBeDefined()
      expect(returnShipmentObj).toEqual(returnShipment)
    })

  })

  it('should filter return shipments by order id ', () => {
    const returnShipmentDto: QueryReturnShipmentDto = new QueryReturnShipmentDto()
    jest.spyOn(httpMiddlewareService, 'filterReturnShipments').mockImplementation(() => of(responseObj))
    service.filterReturnShipments(returnShipmentDto, jwtUser).subscribe(returnShipmentObj => {
      expect(returnShipmentObj).toBeDefined()
      expect(returnShipmentObj).toEqual(responseObj)
    })
  })

  it('should be posible to create a return shipment', () => {
    const returnShipmentDto: CreateReturnShipmentDto = new CreateReturnShipmentDto()
    jest.spyOn(httpMiddlewareService, 'createReturnShipment').mockImplementation(() => of(returnShipment))
    service.createReturnShipment(returnShipmentDto, jwtUser).subscribe(returnShipmentObj => {
      expect(returnShipmentObj).toBeDefined()
      expect(returnShipmentObj).toEqual(returnShipment)
    })
  })

  it('should be posible to update a return shipment', () => {
    const returnShipmentDto: UpdateReturnShipmentDto = new UpdateReturnShipmentDto()
    jest.spyOn(httpMiddlewareService, 'updateReturnShipment').mockImplementation(() => of(returnShipment))
    service.updateReturnShipment(1, returnShipmentDto, jwtUser).subscribe(returnShipmentObj => {
      expect(returnShipmentObj).toBeDefined()
      expect(returnShipmentObj).toEqual(returnShipment)
    })
  })

  it('should be posible to update a return shipment', () => {
    const returnShipmentDto: UpdateReturnShipmentDto = new UpdateReturnShipmentDto()
    jest.spyOn(httpMiddlewareService, 'updateReturnShipment').mockImplementation(() => of(returnShipment))
    service.updateReturnShipment(1, returnShipmentDto, jwtUser).subscribe(returnShipmentObj => {
      expect(returnShipmentObj).toBeDefined()
      expect(returnShipmentObj).toEqual(returnShipment)
    })
  })

})
