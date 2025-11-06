export interface PaginatedResult<Entity> {
  items: Array<Entity>
  meta: any
  links: any
}