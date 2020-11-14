'use strict'

const Joi = require('joi')
const logger = require('winston')

const paramsSchema = Joi.object({
  date: Joi.date().iso().required(),
  query: Joi.string().required(),
})

const channelName = 'trigger'
const pageCount = 1

function trigger(params) {
  try {
    Joi.attempt(params, paramsSchema)

    return { ...params, pageCount }
  } catch (e) {
    logger.error(`Errors in ${channelName} worker`, e)
  }

  return {}
}

module.exports = trigger
module.exports.channelName = channelName
