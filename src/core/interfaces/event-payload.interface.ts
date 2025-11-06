export interface EventPayload<T = any> {
  trigger_id: string
  logged_at: Date
  data: T
}