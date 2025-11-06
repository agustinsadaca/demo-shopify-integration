export class SftpFileDescriptor {
  type: string
  name: string
  size: number
  modifyTime: number
  accessTime: number
  rights: { user: string, group: string, other: string }
  owner: string
  group: string
}