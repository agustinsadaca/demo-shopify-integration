export type LBFunctionCallBack = (err: null | Error, data: any) => void
export type LBResult = {
  data?: Array<any>,
  errors?: Array<Error>
}

type LBQueue = {
  payload: any,
  interceptor: Function,
  callback: LBFunctionCallBack
}

export type LeakyBucketType = {
  queue: LBQueue[],
  interval: null | NodeJS.Timeout
}