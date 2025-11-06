import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '../config.service'
import { TargetSync } from './entities/target-sync.entity'

@Injectable()
export class TargetSyncService {
  constructor(@InjectRepository(TargetSync) private targetSyncRepository: Repository<TargetSync>) {}

  async getLastSyncedAt(entityType: string, connectionId: number): Promise<Date> {
    const targetSync = await this.targetSyncRepository.findOne({
      where: {
        entityType: entityType,
        connectionAuthId: connectionId
      },
      order: {
        syncedAt: 'DESC'
      }
    })

    if (!targetSync) {
      return new Date(ConfigService.getInitialSyncDate())
    }

    return targetSync.syncedAt
  }

  async setLastSyncedAt(
    entityType: string,
    syncedAt: Date,
    connectionId: number,
    entityCount?: number
  ) {
    try {
      const targetSync = this.targetSyncRepository.create({
        entityType: entityType,
        syncedAt: syncedAt,
        connectionAuthId: connectionId,
        entityCount: entityCount
      })
      await this.targetSyncRepository.save(targetSync)
    } catch (err) {
      throw err
    }
  }
}
