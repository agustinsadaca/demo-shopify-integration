export interface SftpServer {

  connect(options: { basePath: string }): Promise<void>

  disconnect(): Promise<void>

  writeFile(filePath: string, fileName: string, content: string): Promise<any>

  getNextFileNameAndLock(folderPath: string, suffix?: string): Promise<string>

  readFile(filePath: string): Promise<string>

  archive(filePath: string): Promise<void>

  getNextFileNameForWip(folderPath: string, olderThanMillisecond: number): Promise<string>

}