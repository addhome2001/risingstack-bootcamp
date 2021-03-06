'use strict'

const logger = require('winston')
const getRedisClient = require('../redis/getRedisClient')
const createHealthCheckServer = require('../helpers/createHealthCheckServer')

// Workers
const { trigger, repository, contribution } = require('../workers')

const {
  redisClient: subClient,
  healthCheck: subHealthCheck,
  destroy: subDestroy,
} = getRedisClient(process.env.REDIS_URI)

const {
  redisClient: pubClient,
  healthCheck: pubHealthCheck,
  destroy: pubDestroy
} = getRedisClient(process.env.REDIS_URI)

const destroyRedisClients = () =>
  Promise.all([
    subDestroy(),
    pubDestroy(),
  ])

const healthCheckRedisClients = () =>
  Promise.all([
    pubHealthCheck(),
    subHealthCheck()
  ])

const { TRIGGER_QUERY } = process.env

async function init() {
  const date = new Date()

  try {
    const count = await new Promise((resolve, reject) => {
      subClient.subscribe(
        trigger.channelName,
        repository.channelName,
        contribution.channelName,
        (err, c) => {
          if (err) return reject(err)
          return resolve(c)
        }
      )
    })

    logger.info(`There are ${count} channels we are currently subscribed to.`)

    // Trigger the workers
    pubClient.publish(trigger.channelName, JSON.stringify({
      date: date.toISOString(),
      query: TRIGGER_QUERY
    }))

    subClient.on('message', async (channel, message) => {
      const parsedMessage = JSON.parse(message)

      if (!channel) return

      logger.info(`Channel: ${channel} received.`)

      switch (channel) {
        case trigger.channelName: {
          const { pageCount, ...rest } = trigger(parsedMessage)

          if (!pageCount) return

          Array.from({ length: pageCount }).forEach((_, page) => {
            pubClient.publish(repository.channelName, JSON.stringify({ ...rest, page: page + 1 }))
          })
          break
        }

        case repository.channelName: {
          repository(
            parsedMessage,
            (params) => pubClient.publish(contribution.channelName, JSON.stringify(params))
          )

          break
        }

        case contribution.channelName:
          contribution(parsedMessage)
          break

        default:
          logger.info(`Channel: ${channel} not found.`)
      }
    })
  } catch (e) {
    await destroyRedisClients()
    logger.error(`Error when executing trigger.js: ${e.stack}`)
  }
}

init()
createHealthCheckServer({ healthCheckRedisClients, destroyRedisClients })
