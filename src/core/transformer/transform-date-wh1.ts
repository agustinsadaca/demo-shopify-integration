import { TransformFnParams } from 'class-transformer'
import { isDate } from 'class-validator'

export function TransformDateWh1({ value, key, obj }: TransformFnParams) {
  if (!obj[key]?.length) {
    return undefined
  }

  if (!isDate(new Date(obj[key]))) {
    return undefined
  }

  return value
}