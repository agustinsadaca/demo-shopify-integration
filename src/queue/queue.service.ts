import { B2cAuthResponseDto, ReturnRequest } from '../core/types/common.types'
import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { JobOptions, Queue } from 'bull'
import { BrandLabel } from '../brand-label/entities/brand-label.entity'
import {
  GLOBAL_SHARED_QUEUE,
  REMOVE_BRAND_LABEL_DOMAIN_CONFIGURATION_JOB,
  TRACK_RETURN_LABEL_JOB
} from './queue.constant'

export type RemoveBrandLabelDomainConfigurationJobData = {
  implementationId: number
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name)

  constructor(@InjectQueue(GLOBAL_SHARED_QUEUE) private queue: Queue) {}

  async addTrackReturnLabelJob(
    b2cAuthResponse: B2cAuthResponseDto,
    implementationId: number,
    returnRequests: ReturnRequest[]
  ) {
    try {
      const orderIds = b2cAuthResponse.orders.map((order) => order.orderId)

      this.logger.log(`creating job to track return request of order ids: ${orderIds.toString()}`)

      const ONE_MINUTES_IN_MILLISECONDS = 1000 * 60

      const jobOption: JobOptions = {
        delay: ONE_MINUTES_IN_MILLISECONDS * 60 * 6, // 6 hours
        removeOnComplete: true
      }

      const jobData: any = {
        orderIds,
        implementationId: implementationId,
        returnRequests: returnRequests.map((returnRequest) => {
          delete returnRequest.qrCode
          delete returnRequest.pdfCode
          return returnRequest
        })
      }

      const job = await this.queue.add(TRACK_RETURN_LABEL_JOB, jobData, jobOption)
      this.logger.log(`Job created with job id: ${job.id}`)

      return job
    } catch (error) {
      this.logger.error(error, error?.stack)
    }
  }

  async addRemoveBrandLabelDomainConfigurationJob(brandLabel: BrandLabel) {
    try {
      this.logger.log(
        `creating job to remove brand label domain configuration of brand label id: ${brandLabel.id} and implementation id: ${brandLabel.implementationId}`
      )

      const jobOption: JobOptions = {
        delay: 30 * 60 * 1000, // 30 minutes
        removeOnComplete: true
      }

      const jobData: RemoveBrandLabelDomainConfigurationJobData = {
        implementationId: brandLabel.implementationId
      }

      const job = await this.queue.add(
        REMOVE_BRAND_LABEL_DOMAIN_CONFIGURATION_JOB,
        jobData,
        jobOption
      )
      this.logger.log(
        `Job created with job id: ${job.id} for removing brand label domain configuration of brand label id: ${brandLabel.id}`
      )

      return job
    } catch (error) {
      this.logger.error(error, error?.stack)
    }
  }
}
