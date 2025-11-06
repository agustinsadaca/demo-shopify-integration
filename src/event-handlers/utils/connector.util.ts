export class ConnectorUtils {
  static getLastByDate(items: Array<any>, dateFieldName: string): any {
    if (!items || items.length === 0) {
      return undefined
    }

    return items.reduce((latest, current) => {
      const currentDate = current[dateFieldName] ? new Date(current[dateFieldName]) : new Date(0)
      const latestDate = latest[dateFieldName] ? new Date(latest[dateFieldName]) : new Date(0)
      
      return currentDate > latestDate ? current : latest
    }, items[0])
  }
}
