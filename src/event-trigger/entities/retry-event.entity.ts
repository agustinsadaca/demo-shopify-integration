import { Base } from '../../core/entities/base.entity'
import { OrgType } from '../../shop-connectors/shopify/entities/enums.entity'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsPositive, Min } from 'class-validator'
import { Column, Entity } from 'typeorm'
import { RetryEventStatusEnum } from '../../core/enums/retry-event-status.enum'

@Entity({
  orderBy: {
    id: "ASC"
  }
})
export class RetryEvent extends Base {
  @ApiProperty({ required: true })
  @Column({ nullable: false })
  entity: string

  @ApiProperty({ required: true })
  @Column({ nullable: false })
  action: string

  @ApiProperty({ required: false })
  @Column({ nullable: false })
  target: OrgType

  @ApiProperty({ required: true })
  @IsPositive()
  @Column({ nullable: false })
  implementationId: number

  @ApiProperty({ required: false })
  @IsPositive()
  @Column({ nullable: false })
  targetTypeId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Column('jsonb', { nullable: true })
  data?: object

  @ApiProperty({ required: true })
  @Min(0)
  @Column({ nullable: false })
  maxAllowedRetry: number

  @ApiProperty({ required: true })
  @Min(0)
  @Column({ nullable: true })
  retryCount: number

  @ApiProperty({ required: true })
  @Column({ type: 'enum', enum: RetryEventStatusEnum })
  status: RetryEventStatusEnum

  @ApiProperty({ required: true })
  @Column({ type: "timestamptz", nullable: true, })
  nextRetryTime: Date

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  retryReason?: string
}