'use strict'

const Joi = require('joi')
const logger = require('winston')

const envVar = process.env
const envSchema = Joi.object({
  PORT: Joi
    .number()
    .integer()
    .min(3000)
    .max(3999),
  GITHUB_ACCESS_TOKEN: Joi.string().required(),
  GITHUB_API: Joi.string().required(),
  PG_CONNECTION_STRING: Joi.string().required(),
}).unknown()

try {
  Joi.attempt(envVar, envSchema)
} catch (e) {
  logger.error('There are some validation errors', e.details)
  process.exit(1)
}

const config = {
  port: envVar.PORT || 3000,
  githubAccessToken: envVar.GITHUB_ACCESS_TOKEN,
  githubApi: envVar.GITHUB_API,
  pgConnectionUrl: envVar.PG_CONNECTION_STRING,
}

module.exports = config
