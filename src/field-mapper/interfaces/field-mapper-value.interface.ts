import { FieldMapper } from '../entities/field-mapper.entity'

export interface FieldMapperValue {
  fieldMappersObj: { [key: string]: string }
  defaultFieldMapper: FieldMapper
}