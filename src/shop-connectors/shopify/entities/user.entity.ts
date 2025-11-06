import { OrgType, Role } from './enums.entity'

export interface JwtUser {
  implementationIds: string
  entityRole: OrgType | Role
  entityId: number
}
