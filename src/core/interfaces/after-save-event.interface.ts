import { JwtUser } from '../types/common.types'

export interface AfterSaveEvent<T = any> {
  created?: T
  updated?: T
  user: JwtUser
}