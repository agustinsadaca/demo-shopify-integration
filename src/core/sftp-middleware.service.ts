import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomUUID } from 'crypto'
import { RoutedMessage } from '../event-handlers/interfaces/routed-message.interface'
import { SftpConfig } from './interfaces/sftp-config.interface'
import { SftpFileDescriptor } from './interfaces/sftp-file-descriptor.interface'
import path = require('path')
import SftpClient = require('ssh2-sftp-client')

export const wipSuffixText = '.WIP'

export class SftpMiddlewareService {
  private readonly logger = new Logger(SftpMiddlewareService.name)
  private client: SftpClient
  private config: SftpConfig
  private wipSuffix = wipSuffixText
  private archiveFolder = 'archive'
  private connectionUniqueId: string

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  isConnected(): boolean {
    if (!this.client || !this.client.sftp) {
      return false
    }

    return true
  }

  private getConnectionUniqueId() {
    return randomUUID() + '-' + Date.now()
  }

  private async connectWithRetry(config: SftpConfig, retries: number = 3) {
    let attempts = 0
    while (attempts <= retries) {
      attempts++
      try {
        await this.client.connect(config)
        break
      } catch (err) {
        this.logger.error(
          `[connectWithRetry] Error while connecting to SFTP host ${config.host} with error code: ${err.code}`
        )

        switch (err.code) {
          case 'ENOTFOUND':
          case 'ECONNREFUSED':
          case 'ERR_SOCKET_BAD_PORT': {
            throw err
          }
          case undefined: {
            if (
              err.message.endsWith('All configured authentication methods failed') ||
              err.message.startsWith('Cannot parse privateKey')
            ) {
              throw err
            }
            break
          }
          default:
            break
        }
        if (attempts > retries) {
          this.logger.error(
            `[connectWithRetry] Maximum retry attempts reached for sftp host ${config.host}. Giving up.`
          )
          throw err
        }
        const delay = Math.pow(2, attempts - 1) * 2000
        this.logger.log(
          `[connectWithRetry] Waiting ${delay}ms before retry for sftp host ${config.host}...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  async connect(config: SftpConfig, message?: RoutedMessage) {
    this.config = config

    if (this.isConnected()) {
      return this.client
    }

    const existingConnection = await this.cacheManager.get('sftp-connection')
    if (existingConnection) {
      this.logger.error({
        message: 'Found existing connection',
        existingConnection: existingConnection
      })
    }

    this.connectionUniqueId = `${this.getConnectionUniqueId()}-${message.entity}-${message.action}`

    this.client = new SftpClient()
    try {
      await this.connectWithRetry(config)
      await this.cacheManager.set('sftp-connection', this.connectionUniqueId, 0)
      this.logger.log(`New SFTP connection ${this.connectionUniqueId} with host ${config.host}`)

      this.addListeners()
      return Promise.resolve()
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  private addListeners() {
    this.client.on('error', async (err) => {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      await this.cacheManager.del('sftp-connection')
      this.client = null
    })
  }

  async list(folder: string): Promise<object[]> {
    try {
      const fullPath = await this.getFullPathOrFail(folder)
      return this.client.list(fullPath)
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = await this.getFullPathOrFail(filePath)
      const fileContent = await this.client.get(fullPath)
      return fileContent.toString()
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  async writeFile(filePath: string, fileName: string, content: string): Promise<void> {
    try {
      const fullPath = await this.getFullPathOrFail(filePath)
      const absoluteFileName = path.join(fullPath, fileName)
      return await this.client.put(Buffer.from(content, 'utf8'), absoluteFileName)
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  async disconnect(): Promise<Boolean> {
    try {
      if (this.isConnected()) {
        await this.client.end()
      }

      const existingConnection = await this.cacheManager.get('sftp-connection')
      if (existingConnection) {
        this.logger.log(`Disconnecting and Removing connection ${existingConnection}`)
        await this.cacheManager.del('sftp-connection')
      }

      return Promise.resolve(true)
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      return Promise.resolve(false)
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        this.logger.warn(`No existing connection available`)
        return Promise.resolve(false)
      }
      // will be false or d, -, l (dir, file or link)
      return (await this.client.exists(filePath)) ? true : false
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  async rename(from: string, to: string): Promise<string> {
    try {
      if (await this.exists(to)) {
        throw new Error(`File ${to} already exists`)
      }
      const fullFrom = await this.getFullPathOrFail(from)
      return await this.client.rename(fullFrom, to)
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  async getFullPathOrFail(relativePath: string): Promise<string> {
    let absolutePath = relativePath
    let exists = false

    if (relativePath === undefined) {
      return ''
    }

    if (!relativePath.includes(this.config.basePath)) {
      absolutePath = path.join(this.config.basePath, relativePath)
    }
    try {
      exists = await this.exists(absolutePath)

      if (!exists) return ''

      return absolutePath
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  async getNextFileNameAndLock(folder: string, suffix?: string) {
    try {
      folder = await this.getFullPathOrFail(folder)
      if (folder === '') {
        this.logger.error('No folder provided')
        return ''
      }
      const files = await this.list(folder)
      const file = <SftpFileDescriptor>files.find((f: SftpFileDescriptor) => {
        if (suffix) return f.type === '-' && f.name.endsWith(suffix)
        return f.type === '-' && !f.name.endsWith(this.wipSuffix)
      })
      if (file === undefined) {
        return ''
      }
      const fileName = path.join(folder, file.name)
      const wipFileName = fileName + this.wipSuffix
      await this.rename(fileName, wipFileName)
      return wipFileName
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  private isOldWipFile(f: SftpFileDescriptor, olderThanMillisec: number) {
    const hasFileType = f.type === '-'
    const hasWipSuffix = f.name.endsWith(this.wipSuffix)

    if (!hasFileType || !hasWipSuffix) return

    return Date.now() - f.modifyTime > olderThanMillisec
  }

  async getNextFileNameForWip(folder: string, olderThanMillisec: number) {
    try {
      folder = await this.getFullPathOrFail(folder)
      const files = await this.list(folder)
      const file = <SftpFileDescriptor>(
        files.find((f: SftpFileDescriptor) => this.isOldWipFile(f, olderThanMillisec))
      )
      if (file === undefined) {
        return ''
      }

      const fileName = path.join(folder, file.name)
      return fileName
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }

  async archive(absoluteFileName: string, entityFolder?: string): Promise<void> {
    try {
      const fileName = path.basename(absoluteFileName).replace(this.wipSuffix, '')

      if (!entityFolder) {
        entityFolder = path.dirname(absoluteFileName).split(path.sep).pop()
      }

      const parentFolderAndFileName = path.join(entityFolder, fileName)
      const archiveFolderFullPath = path.join(this.config.basePath, this.archiveFolder)
      await this.rename(absoluteFileName, path.join(archiveFolderFullPath, parentFolderAndFileName))
    } catch (err) {
      if (err?.code === 'ECONNRESET') {
        this.logger.warn(err, err?.stack)
      } else {
        this.logger.error(err, err?.stack)
      }
      throw err
    }
  }
}
