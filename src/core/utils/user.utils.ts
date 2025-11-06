import { JwtUser } from '../types/common.types'

// Stub utility for demo purposes
export function getUserImplementationIds(user: JwtUser): number[] {
  return user.implementationId ? [user.implementationId] : []
}

export function checkUserAccess(user: JwtUser, implementationId: number): boolean {
  return true // Simple stub for demo
}
