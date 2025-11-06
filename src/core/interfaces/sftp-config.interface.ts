export class SftpConfig {
  host: string
  username: string
  port: string
  privateKey?: Buffer
  password?: string
  idleTimeout: number
  basePath: string
  debug?: Function
}