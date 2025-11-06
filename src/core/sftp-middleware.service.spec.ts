import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import path from 'path'
import { SftpMiddlewareService } from './sftp-middleware.service'

jest.mock('ssh2-sftp-client', () => {
  return jest.fn().mockImplementation((SftpClient) => {
    return {
      connect: jest.fn(),
      sftp: 'some-sftp-instance',
      on: jest.fn(),
      end: jest.fn(),
      list: jest.fn(),
      rename: jest.fn(() => Promise.resolve('renamed')),
      get: jest.fn(() => Promise.resolve(Buffer.from('some-file-content'))),
      put: jest.fn(() => Promise.resolve()),
      exists: jest.fn((path: string) => ('/true' === path) ? Promise.resolve(true) : Promise.resolve(false))
    }
  })
})

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
}

describe('SftpMiddlewareService', () => {
  let service: SftpMiddlewareService
  const config = {
    host: 'host',
    port: '22',
    username: 'username',
    password: 'password',
    idleTimeout: 1000,
    basePath: ''
  }
  afterAll(() => {
    jest.restoreAllMocks()
  })

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SftpMiddlewareService, { provide: CACHE_MANAGER, useValue: mockCacheManager }]
    }).compile()

    service = module.get<SftpMiddlewareService>(SftpMiddlewareService)
    await service.connect(config, { entity: 'entity', action: 'action', implementationId: 1 })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should be able to connect', async () => {
    expect(service.isConnected()).toBeTruthy()
  })

  it('should be possible to list a directory', async () => {
    await service.list('/true')
    expect(service.isConnected()).toBeTruthy()
  })

  it('should be possible to check if a directory doesn\'t exists', async () => {
    expect(await service.exists('/false')).toBeFalsy()
  })

  it('should be possible to read a file', async () => {
    expect(typeof await service.readFile('/true')).toBe('string')
  })

  it('should be possible to write a file', async () => {
    expect(await service.writeFile('/true', 'fileName', 'content')).toBe(void 0)
  })

  it('should be possible to rename a file', async () => {
    expect(await service.rename('/true', '/newName')).toBe('renamed')
  })

  it('should be possible to get the next file and lock from a directory', async () => {
    jest.spyOn(service, 'getFullPathOrFail').mockImplementation(() => Promise.resolve('/export/orders'))
    jest.spyOn(service, 'list').mockReturnValueOnce(Promise.resolve(
      [{
        type: '-',
        name: 'orderFile.csv',
        size: 1,
        modifyTime: 2,
        accessTime: 3,
        rights: { user: 'u', group: 'g', other: 'o' },
        owner: 'o',
        group: 'g',
      }]
    ))
    jest.spyOn(service, 'rename').mockImplementation(() => Promise.resolve('success'))

    expect(await service.getNextFileNameAndLock(`${path.sep}export${path.sep}orders`)).toBe(`${path.sep}export${path.sep}orders${path.sep}orderFile.csv.WIP`)
    expect(service.rename).toHaveBeenCalledWith(`${path.sep}export${path.sep}orders${path.sep}orderFile.csv`, `${path.sep}export${path.sep}orders${path.sep}orderFile.csv.WIP`)
  })

  it('should be possible to archive a file', async () => {
    jest.spyOn(service, 'rename').mockImplementation(() => Promise.resolve('success'))

    await service.archive(`${path.sep}export${path.sep}orders${path.sep}orderFile.csv.WIP`)
    expect(service.rename).toHaveBeenCalledWith(`${path.sep}export${path.sep}orders${path.sep}orderFile.csv.WIP`, `archive${path.sep}orders${path.sep}orderFile.csv`)
  })
})