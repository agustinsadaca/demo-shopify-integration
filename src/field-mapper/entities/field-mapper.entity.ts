import { Base } from '../../core/entities/base.entity'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { Column, Entity } from 'typeorm'
import { FieldMapperEntityTypesEnum } from '../enums/entity-types.enum'

@Entity({
  orderBy: {
    id: "ASC"
  }
})
export class FieldMapper extends Base {
  @ApiProperty({ enum: FieldMapperEntityTypesEnum, required: true })
  @Column({ nullable: false })
  @IsEnum(FieldMapperEntityTypesEnum)
  entityType: string

  @ApiProperty({ required: true })
  @Column({ nullable: false })
  entityField: string

  @ApiProperty({ required: true })
  @Column({ nullable: false })
  wmsValue: string

  @ApiProperty({ required: true })
  @Column({ nullable: false })
  shopValue: string

  @ApiProperty({ required: true })
  @Column({ nullable: false })
  implementationId: number

  @ApiProperty({ required: true })
  @Column({ nullable: false })
  name: string

  @ApiProperty({ required: false, default: false })
  @Column({ default: false })
  isDefault: boolean
}