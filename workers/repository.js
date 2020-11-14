'use strict'

const Joi = require('joi')
const logger = require('winston')
const _ = require('lodash/fp')
const { searchRepositories } = require('../web/models/github')
const { User, tableName: userTableName } = require('../web/models/User')
const { Repository, tableName: repoTableName } = require('../web/models/Repository')
const ValidationError = require('../web/models/ValidationError')

function logWithValidationError(e, tableName) {
  if (e instanceof ValidationError) {
    logger.error(`Worker ${channelName} -> Errors when inert ${tableName}`, e)
  }
}

const paramsSchema = Joi.object({
  date: Joi.date().iso().required(),
  query: Joi.string().required(),
  page: Joi.number().required()
})

const channelName = 'repository'
const perPage = 10

async function repository(params, publish) {
  try {
    Joi.attempt(params, paramsSchema)

    const { query, date, page } = params

    const response = await searchRepositories({ q: query, page, per_page: perPage })
    const result = await response.json()
    const repositories = _.get('items', result) || []

    await Promise.all(repositories.map(async (repo) => {
      const owner = _.get('owner', repo) || {}

      try {
        await User.insert({
          id: owner.id,
          login: owner.login,
          avatarUrl: owner.avatar_url,
          htmlUrl: owner.html_url,
          type: owner.type,
        })

        logger.info(`Worker ${channelName} -> Inserted a owner into ${userTableName} table`)
      } catch (e) {
        logWithValidationError(e, userTableName)
      }

      try {
        await Repository.insert({
          id: repo.id,
          owner: owner.id,
          fullName: repo.full_name,
          description: repo.description,
          htmlUrl: repo.html_url,
          language: repo.language,
          stargazersCount: repo.stargazers_count,
        })
        logger.info(`Worker ${channelName} -> Inserted a repository into ${repoTableName} table`)
      } catch (e) {
        logWithValidationError(e, repoTableName)
      }

      publish({ date, repository: { id: repo.id, fullName: repo.full_name } })
    }))
  } catch (e) {
    logger.error(`Worker ${channelName} -> General errors`, e)
  }

  return {}
}

module.exports = repository
module.exports.channelName = channelName
