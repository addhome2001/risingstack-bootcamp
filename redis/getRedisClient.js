'use strict'

const Redis = require('ioredis')
const { promisify } = require('util')

function getRedisClient(REDIS_URI) {
  const redisClient = new Redis(REDIS_URI)
  const healthCheck = promisify(redisClient.ping).bind(redisClient)
  const destroy = redisClient.quit

  return {
    redisClient,
    healthCheck,
    destroy,
  }
}

module.exports = getRedisClient
