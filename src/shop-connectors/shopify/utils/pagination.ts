export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export interface PaginationLinks {
  first?: string
  previous?: string
  next?: string
  last?: string
}

export class Pagination<T> {
  items: T[]
  meta: PaginationMeta
  links?: PaginationLinks

  constructor(
    items: T[],
    totalItems: number,
    currentPage: number = 1,
    itemsPerPage: number = 10
  ) {
    this.items = items
    this.meta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage
    }
  }

  static create<T>(
    items: T[],
    totalItems: number,
    page: number = 1,
    limit: number = 10
  ): Pagination<T> {
    return new Pagination(items, totalItems, page, limit)
  }
}
