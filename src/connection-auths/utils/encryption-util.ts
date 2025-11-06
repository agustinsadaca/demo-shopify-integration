import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { ConfigService } from '../../config.service'

const authKeys = [
  'secretKey',
  'apiKey',
  'password',
  'authToken',
  'xmlSecretKey',
  'clientSecret',
  'dhl_api_key',
  'token'
]

@Injectable()
export class Encryption {
  private randomIv: Buffer = crypto.randomBytes(16)
  private encryptionKey: string = ConfigService.getEncryptionKey()
  private algorithm: string = 'aes-256-ctr'

  constructor() {}

  encrypt(data: crypto.BinaryLike) {
    let cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey),
      this.randomIv
    )
    let buffer = cipher.update(data)
    let result = this.randomIv.toString('hex') + ':' + buffer.toString('hex')

    cipher.final()

    return result
  }

  decrypt(cipherText: string): string | null {
    let cryptedParts = cipherText.split(':')
    if (cryptedParts.length < 2) return null

    let currentIv = Buffer.from(cryptedParts.shift(), 'hex')
    let encryptedData = Buffer.from(cryptedParts.join(':'), 'hex')
    let decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey),
      currentIv
    )
    let result = decipher.update(encryptedData).toString()

    decipher.final()

    return result
  }

  encryptConnectionAuth(connectionAuth) {
    try {
      for (let key in connectionAuth.authObject) {
        if (authKeys.includes(key) && this.encryptionKey) {
          const encrypted = this.encrypt(connectionAuth.authObject[key])
          connectionAuth.authObject[key] = encrypted
        }
      }
    } catch (err) {
      throw err
    }
  }

  decryptConnectionAuth(connectionAuth) {
    let connAuthList = []
    connectionAuth.items ? (connAuthList = connectionAuth.items) : (connAuthList = [connectionAuth])

    try {
      for (const connAuth of connAuthList) {
        for (const key in connAuth.authObject) {
          if (authKeys.includes(key) && this.encryptionKey) {
            const decrypted = this.decrypt(connAuth.authObject[key])
            if (decrypted === null) continue

            connAuth.authObject[key] = decrypted
          }
        }
      }
    } catch (err) {
      throw err
    }
  }

  encryptCarrierAuth(records: Record<string, any>) {
    try {
      for (let key in records) {
        if (typeof records[key] === 'object') this.encryptCarrierAuth(records[key])
        else if (authKeys.includes(key) && this.encryptionKey) {
          const encrypted = this.encrypt(records[key])
          records[key] = encrypted
        }
      }
    } catch (err) {
      throw err
    }
  }

  decryptCarrierAuth(records: Record<string, any>[]) {
    try {
      for (let record of records) {
        for (let key in record) {
          if (typeof record[key] === 'object') this.decryptCarrierAuth([record[key]])
          else if (authKeys.includes(key) && this.encryptionKey) {
            const decrypted = this.decrypt(record[key])
            if (decrypted === null) continue

            record[key] = decrypted
          }
        }
      }
    } catch (err) {
      throw err
    }
  }
}
