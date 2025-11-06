import { ApiProperty } from '@nestjs/swagger'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ConnectionAuth } from '../../connection-auths/entities/connection-auth.entity'

@Entity({
  orderBy: {
    id: "ASC"
  }
})
export class TargetSync {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id?: number

  @ApiProperty()
  @Column({ nullable: false })
  entityType: string

  @ManyToOne(type => ConnectionAuth, connectionAuth => connectionAuth.targetSyncs, { nullable: false })
  connectionAuth: ConnectionAuth

  @ApiProperty()
  @Column({ nullable: false })
  connectionAuthId: number

  @ApiProperty()
  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  syncedAt: Date

  @ApiProperty()
  @Column({ nullable: true })
  entityCount: number
}