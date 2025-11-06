import { Base } from '../../core/entities/base.entity'
import { OrgType, TargetSystemEnum } from '../../shop-connectors/shopify/entities/enums.entity'
import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, OneToMany } from 'typeorm'
import { TargetSync } from '../../core/entities/target-sync.entity'
import { ConnectionAuthMetaInfo } from '../../core/interfaces/connection-auth-meta-info.interface'

@Entity({
  orderBy: {
    id: 'ASC'
  }
})
export class ConnectionAuth<TS = TargetSystemEnum> extends Base {
  @ApiProperty()
  @Column({ nullable: false })
  connectionUrl: string

  @ApiProperty()
  @Column({ type: 'enum', enum: OrgType })
  targetType: OrgType

  @ApiProperty()
  @Column({ type: 'enum', enum: TargetSystemEnum })
  targetSystem: TargetSystemEnum

  @ApiProperty()
  @Column('jsonb', { nullable: true })
  authObject: object

  @ApiProperty()
  @Column()
  authStrategy: string

  @ApiProperty()
  @Column({ nullable: false })
  implementationId: number

  @ApiProperty({ required: false })
  @Column('int4', { array: true, nullable: true })
  sharedImplementations?: number[]

  @ApiProperty()
  @Column('boolean', { nullable: false, default: true })
  isActive: boolean

  @OneToMany(type => TargetSync, targetSync => targetSync.connectionAuth)
  targetSyncs: TargetSync[]

  @ApiProperty()
  @Column({ nullable: false })
  targetTypeId: number

  @ApiProperty()
  @Column({ nullable: true })
  targetSystemConnectionId?: string

  @ApiProperty({ required: false, type: ConnectionAuthMetaInfo })
  @Column('jsonb', { nullable: true })
  metaInfo?: ConnectionAuthMetaInfo<TS>

  @ApiProperty({ required: false, example: "+HH:MM" })
  @Column({ nullable: true })
  defaultTimezone?: string

  @ApiProperty({ required: false })
  @Column('int4', { nullable: true, comment: 'delay order release in minutes' })
  delayOrderReleaseInMinutes?: number
}
