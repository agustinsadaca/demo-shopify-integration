export class PartialCompletedDto {
  partialFulfilmentsOrderIds: Array<number>
  completedFulfilmentsOrderIds: Array<number>
  fulfillmentOrderQuantityMapping: Map<number, number>
}

export class PartialCompletedGraphQLDto {
  partialFulfilmentsOrderIds: Array<string>
  completedFulfilmentsOrderIds: Array<string>
  fulfillmentOrderQuantityMapping: Map<number, number>
}