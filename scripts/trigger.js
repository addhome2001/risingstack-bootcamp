'use strict'

const logger = require('winston')
const Redis = require('ioredis')

// Workers
const { trigger, repository, contribution } = require('../workers')

const redis = new Redis(process.env.REDIS_URI)
const pub = new Redis(process.env.REDIS_URI)

const disconnectConnections = () => {
  redis.disconnect()
  pub.disconnect()
}

const { TRIGGER_QUERY } = process.env

async function init() {
  const date = new Date()

  try {
    const count = await new Promise((resolve, reject) => {
      redis.subscribe(
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
    pub.publish(trigger.channelName, JSON.stringify({
      date: date.toISOString(),
      query: TRIGGER_QUERY
    }))

    redis.on('message', async (channel, message) => {
      const parsedMessage = JSON.parse(message)

      if (!channel) return

      logger.info(`Channel: ${channel} received.`)

      switch (channel) {
        case trigger.channelName: {
          const { pageCount, ...rest } = trigger(parsedMessage)

          if (!pageCount) return

          Array.from({ length: pageCount }).forEach((_, page) => {
            pub.publish(repository.channelName, JSON.stringify({ ...rest, page: page + 1 }))
          })
          break
        }

        case repository.channelName: {
          repository(
            parsedMessage,
            (params) => pub.publish(contribution.channelName, JSON.stringify(params))
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
    disconnectConnections()
    logger.error(`Error when executing trigger.js: ${e.stack}`)
  }
}

init()
