'use strict'

const Joi = require('joi')
const logger = require('winston')
const { getContributors } = require('../web/models/github')
const { Contribution, tableName: contributionTableName } = require('../web/models/Contribution')
const { User, tableName: userTableName } = require('../web/models/User')
const ValidationError = require('../web/models/ValidationError')

function logWithValidationError(e, tableName) {
  if (e instanceof ValidationError) {
    logger.error(`Worker ${channelName} -> Errors when inert ${tableName}`, e)
  }
}

const paramsSchema = Joi.object({
  date: Joi.date().iso().required(),
  repository: Joi.object({
    id: Joi.number().required(),
    fullName: Joi.string().required()
  })
})

const channelName = 'contribution'

async function contribution(params) {
  try {
    Joi.attempt(params, paramsSchema)

    const { repository } = params

    const response = await getContributors(repository.fullName)
    const contributions = await response.json()

    await Promise.all(contributions.map(async ({ total = 0, author } = {}) => {
      try {
        await User.insert({
          id: author.id,
          login: author.login,
          avatarUrl: author.avatar_url,
          htmlUrl: author.html_url,
          type: author.type,
        })

        logger.info(`Worker ${channelName} -> Inserted a owner into ${userTableName} table`)
      } catch (e) {
        logWithValidationError(e, userTableName)
      }

      try {
        await Contribution.insertOrReplace({
          repository: repository.id,
          user: author.id,
          lineCount: total,
        })
        logger.info(`Worker ${channelName} -> Inserted a repository into ${contributionTableName} table`)
      } catch (e) {
        logWithValidationError(e, contributionTableName)
      }
    }))
  } catch (e) {
    logger.error(`Validation errors in ${channelName} worker`, e.details)
  }
}

module.exports = contribution
module.exports.channelName = channelName
