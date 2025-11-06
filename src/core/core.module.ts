import { HttpModule } from '@nestjs/axios'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '../config.service'
import { TargetSync } from './entities/target-sync.entity'
import { HttpMiddlewareService } from './http-middleware.service'
import { S3MiddlewareService } from './s3-middleware.service'
import { SentryUtilService } from './sentry-util.service'
import { SftpMiddlewareService } from './sftp-middleware.service'
import { TargetSyncService } from './target-sync.service'

@Module({
  imports: [
    HttpModule.register(ConfigService.middlewareAxiosRequestConfig()),
    TypeOrmModule.forFeature([TargetSync]),
    CacheModule.register({ isGlobal: true })
  ],
  providers: [
    HttpMiddlewareService,
    TargetSyncService,
    SftpMiddlewareService,
    S3MiddlewareService,
    SentryUtilService
  ],
  exports: [
    HttpMiddlewareService,
    TargetSyncService,
    SftpMiddlewareService,
    S3MiddlewareService,
    SentryUtilService
  ]
})
export class CoreModule {}
