import { RedisClientOptions } from 'redis'

export type RedisModuleOptions = {} & RedisClientOptions

export interface RedisOptionsFactory {
  createClientOptions(name?: string): Promise<RedisModuleOptions> | RedisModuleOptions
}