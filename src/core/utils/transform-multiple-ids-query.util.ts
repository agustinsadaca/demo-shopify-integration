import { Transform } from 'class-transformer'

// Stub utility for demo purposes
export function TransformMultipleIdsQuery() {
  return Transform(({ value }) => {
    if (!value) return undefined
    if (Array.isArray(value)) return value
    return value.split(',').map((id: string) => parseInt(id.trim()))
  })
}

export function transformMultipleQueryIds(value: any): number[] {
  if (!value) return undefined
  if (Array.isArray(value)) return value
  return value.split(',').map((id: string) => parseInt(id.trim()))
}

export function transformMultipleQueryStringIds(value: any): string[] {
  if (!value) return undefined
  if (Array.isArray(value)) return value
  return value.split(',').map((id: string) => id.trim())
}
