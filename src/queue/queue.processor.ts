import { ActionEnum, EntityEnum, OrgType } from '../shop-connectors/shopify/entities/enums.entity'
import {
  BullQueueEvents,
  OnQueueActive,
  OnQueueError,
  OnQueueEvent,
  OnQueueFailed,
  OnQueueRemoved,
  OnQueueStalled,
  Process,
  Processor
} from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { EventTriggerService } from '../event-trigger/event-trigger-service'
import {
  GLOBAL_SHARED_QUEUE,
  TRACK_RETURN_LABEL_JOB
} from './queue.constant'

@Processor(GLOBAL_SHARED_QUEUE)
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name)

  constructor(
    private triggerService: EventTriggerService,
  ) {}

  @Process(TRACK_RETURN_LABEL_JOB)
  async process(job: Job<any>): Promise<any> {
    this.logger.log(
      `publishing kafka event of track return label job with job data: ${JSON.stringify(job.data || {})}`
    )

    this.triggerService.createEventTrigger(
      {
        implementationId: job.data.implementationId,
        entity: EntityEnum.tracking,
        action: ActionEnum.getTrackingDetailsReturnRequest,
        target: OrgType.Carrier,
        data: {
          orderIds: job.data.orderIds,
          returnRequests: job.data.returnRequests
        }
      },
      false,
      false
    )

    this.logger.log(`kafka event published with track return label`)
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job id: ${job.id} of type ${job.name} with data ${JSON.stringify(job.data || {})}...`
    )
  }

  @OnQueueError()
  onError(job: Job) {
    this.logger.error(
      `error job id: ${job.id} of type ${job.name} with data ${JSON.stringify(job.data || {})}...`
    )
  }

  @OnQueueFailed()
  async onFailed(job: Job) {
    this.logger.error(
      `failed job ${job.id} of type ${job.name} with data ${JSON.stringify(JSON.stringify(job.data || {}))}...`
    )
  }

  @OnQueueRemoved()
  async onRemoved(job: Job) {
    this.logger.log(
      `removed job ${job.id} of type ${job.name} with data ${JSON.stringify(JSON.stringify(job.data || {}))}...`
    )
  }

  @OnQueueStalled()
  onQueueStalled(job: Job) {
    this.logger.log(`stalled job id: ${job.id} of type ${job.name} with result ${job.returnvalue}`)
  }

  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onCompleted(job: Job) {
    this.logger.log(
      `Completed job id: ${job.id} of type ${job.name} with result ${job.returnvalue}`
    )
  }
}
