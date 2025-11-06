// Stub utility for demo purposes
export function getErrorLog(error: any, logger?: any): any {
  return { error: error?.message || 'Unknown error' }
}

export function getErrorText(error: any, logger?: any): string {
  return error?.message || 'Unknown error'
}

export function getRequestLog(request: any, logger?: any): any {
  return { request: 'logged' }
}

export function getResponseLog(response: any, logger?: any): any {
  return { response: 'logged' }
}
