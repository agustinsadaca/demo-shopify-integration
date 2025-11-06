import { RedisModuleOptions } from '../global-modules/redis'
import { createClient } from 'redis'

let client

export const createQueueRedisClient = (redisConfig: RedisModuleOptions) => {
  return (type: 'client' | 'subscriber' | 'bclient') => {
    switch (type) {
      case 'client':
      case 'subscriber':
        if (!client) {
          client = createClient(redisConfig)
        }
        return client
    }
  }
}