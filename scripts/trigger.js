'use strict'

const logger = require('winston')
const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URI)

// const { TRIGGER_QUERY } = process.env

try {
  // redis.subscribe('channel')
  // redis.on('channel')
} catch (e) {
  logger.error(`There is error with trigger.js: ${e}`)
} finally {
  redis.disconnect()
  logger.info('Disconnect Redis Successfully')  
}
