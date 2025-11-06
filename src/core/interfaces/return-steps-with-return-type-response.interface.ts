import { ReturnSteps } from '../entities/return-steps.entity'

export class ReturnStepsWithReturnTypeResponse {
  isFreeReturn: boolean
  returnSteps: ReturnSteps[]
}