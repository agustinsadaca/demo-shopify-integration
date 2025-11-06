export interface FeatureFlagContext extends Record<string, any> {
  /**
   * implementation id
   */
  userId?: number
}

export interface FeatureFlag<T = Record<string, any>> {
  name: string
  isEnabled: boolean
  variant: string | null
  payload: T | null
}

export interface FeatureFlagVariant {
  name: string
  enabled: boolean
  payload: Record<string, any>
}
