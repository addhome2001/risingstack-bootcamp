'use strict'

const Joi = require('joi')
const logger = require('winston')

const envVar = process.env
const envSchema = Joi.object({
  PORT: Joi
    .number()
    .integer()
    .min(3000)
    .max(3999)
    .required()
}).unknown()

try {
  Joi.attempt(envVar, envSchema)
} catch (e) {
  logger.error('There are some validation errors', e.details)
  process.exit(1)
}

const config = {
  port: envVar.PORT,
}

module.exports = config
