'use strict'

const logger = require('winston')

async function gracefulShutdown({ serverClose, destroyDB, destroyRedis }) {
  // Disconnect DB, redis and close server
  const services = []

  try {
    if (serverClose) services.push(serverClose())
    if (destroyDB) services.push(destroyDB())
    if (destroyRedis) services.push(destroyRedis())

    await Promise.all(services)
  } catch (e) {
    logger.error('Something went wrong when shutdown server')
    return process.exit(1)
  }

  logger.info('Shutdown server successfully')
  return process.exit(0)
}

module.exports = gracefulShutdown
