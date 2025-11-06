export class GraphQlIdConverter {
  public static convertFromGraphqlId(graphQlId: string): string {
    const splittedArr = graphQlId.split('/')
    const id = splittedArr[splittedArr.length - 1]
    return id
  }

  public static convertToGraphqlId(id: string | number, type: string): string {
    const graphQlId = `gid://shopify/${type}/${id}`
    return graphQlId
  }
}
