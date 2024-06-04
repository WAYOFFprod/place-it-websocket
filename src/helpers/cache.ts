/* eslint-disable no-inline-comments */
import type { RedisClientType } from 'redis'
import { createClient } from 'redis'

let redisClient: RedisClientType
let isReady: boolean

async function getCache(): Promise<RedisClientType> {
  if (!isReady) {
    redisClient = createClient({
      socket:{
        host: '0.0.0.0',
        port: 6379,
      }
    })
    redisClient.on('error', err => console.error(`Redis Error: ${err}`))
    redisClient.on('connect', () => console.info('Redis connected'))
    redisClient.on('reconnecting', () => console.info('Redis reconnecting'))
    redisClient.on('ready', () => {
      isReady = true
      console.info('Redis ready!')
    })
    await redisClient.connect()
  }
  return redisClient
}

getCache().then(connection => {
  redisClient = connection
}).catch(err => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  console.error({ err }, 'Failed to connect to Redis')
})

export {
  getCache,
}