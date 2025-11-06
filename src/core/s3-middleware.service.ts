import AWS_S3, {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable, Logger, Scope } from '@nestjs/common'
import * as fs from 'fs'
import path from 'path'
import { ConfigService } from '../config.service'
import { reportGenerator, ticketAttachmentConfig } from '../config/config'
import { CreateTicketAttachmentUploadPreSignedUrlDto } from '../tickets/dto/createTicketAttachmentUploadPreSignedUrl'
import { SftpServer } from './interfaces/sftp-server.interface'

@Injectable({
  scope: Scope.TRANSIENT
})
export class S3MiddlewareService implements SftpServer {
  private readonly logger = new Logger(S3MiddlewareService.name)
  private S3: S3Client
  private bucket: string
  private basePath: string
  private wipSuffix = '.WIP'
  private archiveFolder = 'archive'

  async connect(options: { basePath: string }): Promise<void> {
    this.logger.log('s3-connect')

    try {
      const awsCreds = ConfigService.getAwsKeyAndSecret()

      this.S3 = new S3Client({
        credentials: {
          accessKeyId: awsCreds.aws_key,
          secretAccessKey: awsCreds.aws_secret
        },
        region: process.env.region
      })

      this.basePath = options.basePath
      if (!this.basePath) {
        throw 'basePath is required'
      }
      this.bucket = this.basePath.split('/')[1]
      return Promise.resolve()
    } catch (err) {
      throw err
    }
  }

  async disconnect(): Promise<void> {
    return Promise.resolve()
  }

  async writeFile(filePath: string, fileName: string, content: string): Promise<any> {
    try {
      if (!filePath || !fileName || !content) {
        throw `filePath and fileName and content are required`
      }

      let params = {
        Body: Buffer.from(content, 'utf8'),
        Bucket: this.bucket,
        Key: `${filePath.slice(this.bucket.length + 2)}/${fileName}`
      }

      await this.S3.send(new PutObjectCommand(params))
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async uploadFile(
    destDirPath: string,
    fileName: string,
    filePath: string | Uint8Array | Buffer,
    extraParams?: Partial<PutObjectCommandInput>
  ): Promise<void> {
    if (!destDirPath || !fileName || !filePath) {
      throw `destDirPath and fileName and filePath are required`
    }

    const file = typeof filePath === 'string' ? fs.createReadStream(filePath) : filePath

    try {
      const key = `${destDirPath}/${fileName}`
      let params: PutObjectCommandInput = {
        Body: file,
        Bucket: this.bucket,
        Key: key
      }

      if (extraParams) {
        params = { ...params, ...extraParams }
      }

      await this.S3.send(new PutObjectCommand(params))

      if (file instanceof fs.ReadStream) {
        file.destroy()
      }

      this.logger.log(`Uploaded the fileName: ${fileName} to Directory: ${destDirPath}`)

      return Promise.resolve()
    } catch (err) {
      if (file instanceof fs.ReadStream) {
        file.destroy(err)
      }

      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async getNextFileNameAndLock(folderPath: string, suffix?: string): Promise<string> {
    try {
      if (!folderPath) {
        throw `folderPath is required`
      }

      let params = {
        Bucket: this.bucket,
        Prefix: `${folderPath.slice(this.bucket.length + 2)}/`,
        Delimiter: '/'
      }

      let list = await this.S3.send(new ListObjectsV2Command(params))

      let item = list.Contents?.find((item) => {
        if (!item.Key) return false
        let fileExt = this.getFileExtension(item.Key)
        if (!fileExt) return false
        if (suffix) return fileExt === suffix
        return fileExt !== this.wipSuffix
      })

      if (!item) return ''

      let wipFileName = `${item.Key}${this.wipSuffix}`

      await this.S3.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${item.Key}`,
          Key: wipFileName
        })
      )

      await this.S3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: item.Key
        })
      )

      return `/${this.bucket}/${wipFileName}`
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      if (!filePath) {
        throw `filePath is required`
      }

      let params = {
        Bucket: this.bucket,
        Key: filePath.slice(this.bucket.length + 2)
      }

      let result = await this.S3.send(new GetObjectCommand(params))

      const bodyStream = result.Body

      const bodyAsString = await bodyStream?.transformToString()

      return bodyAsString!
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async archive(filePath: string): Promise<void> {
    try {
      if (!filePath) {
        throw `filePath is required`
      }
      const fileName = path.basename(filePath).replace(this.wipSuffix, '')
      const entityFolder = path.dirname(filePath).split(path.sep).pop()!
      const archiveFolderPath = path.join(this.basePath, this.archiveFolder, entityFolder, fileName)

      await this.S3.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${filePath.slice(this.bucket.length + 2)}`,
          Key: archiveFolderPath.slice(this.bucket.length + 2)
        })
      )

      await this.S3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: filePath.slice(this.bucket.length + 2)
        })
      )
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async getNextFileNameForWip(folderPath: string, olderThanMillisecond: number): Promise<string> {
    try {
      if (!folderPath || !olderThanMillisecond) {
        throw `folderPath and olderThanMillisecond is required`
      }

      let params = {
        Bucket: this.bucket,
        Prefix: `${folderPath.slice(this.bucket.length + 2)}/`,
        Delimiter: '/'
      }

      let list = await this.S3.send(new ListObjectsV2Command(params))

      let item = list.Contents?.find((item) => {
        return this.isOldWipFile(item, olderThanMillisecond)
      })

      if (!item) return ''

      return `/${this.bucket}/${item.Key}`
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  private isOldWipFile(fileInfo: AWS_S3._Object, olderThanMillisecond: number) {
    if (!fileInfo.Key) return false
    const hasWipSuffix = fileInfo.Key.endsWith(this.wipSuffix)
    if (!hasWipSuffix) return false
    return Date.now() - new Date(fileInfo.LastModified!).getTime() > olderThanMillisecond
  }

  private getFileExtension(filePathOrName: string): string | null {
    let index = filePathOrName.lastIndexOf('.')
    if (index === -1) return null
    return filePathOrName.slice(index)
  }

  async generateSignedUrl(key: string, expirationTime?: number): Promise<string> {
    try {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key })
      const url = await getSignedUrl(this.S3, command, {
        expiresIn: expirationTime ? expirationTime : reportGenerator.signedUrlExpiresInSeconds
      })
      return url
    } catch (error) {
      throw error
    }
  }

  async generateSignedUrlToUploadTicketAttachment(
    key: string,
    createTicketAttachmentUploadPreSignedUrlDto: CreateTicketAttachmentUploadPreSignedUrlDto
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentLength: createTicketAttachmentUploadPreSignedUrlDto.fileSize,
        ContentType: createTicketAttachmentUploadPreSignedUrlDto.fileType,
        Metadata: {
          originalName: createTicketAttachmentUploadPreSignedUrlDto.fileOriginalName
        }
      })
      const preSignedUrl = await getSignedUrl(this.S3, command, {
        expiresIn: ticketAttachmentConfig.signedUrlExpiresInSeconds
      })
      return preSignedUrl
    } catch (error) {
      this.logger.error(
        error,
        'Something went wrong while generating signedUrl for ticket attachments'
      )
      throw error
    }
  }
}
