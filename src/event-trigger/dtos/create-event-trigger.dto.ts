export class CreateEventTriggerDto {
  implementationId: number
  entity?: string
  action?: string
  data?: any
  targetTypeId?: number
  target?: string
}
