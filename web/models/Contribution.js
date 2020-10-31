'use strict'

const Joi = require('joi')
const logger = require('winston')
const db = require('../../db')
const _ = require('lodash')
const { ReadSchema: ReadUserSchema, tableName: userTableName } = require('./User')
const { ReadSchema: ReadRepositorySchema, tableName: repoTableName } = require('./Repository')
const replaceWithPrefix = require('./utils/replaceWithPrefix')
const { table } = require('../../db')

const ReadSchema = Joi.object({
  user: ReadUserSchema,
  repository: ReadRepositorySchema,
})

const ContributionSchema = Joi.object({
  repository: Joi.number().integer(),
  user: Joi.number().integer(),
  lineCount: Joi.number().integer()
})

const tableName = 'contribution'

const Contribution = {
  async read(params) {
    try {
      Joi.attempt(params, ReadSchema.or('user', 'repository'))

      const REPO_PREFIX = '__REPO_PREFIX__'
      const USER_PREFIX = '__USER_PREFIX__'

      const condition = _.omitBy({
        'u.id': _.get(params, 'user.id'),
        'u.login': _.get(params, 'user.login'),
        'r.id': _.get(params, 'repository.id'),
        'r.full_name': _.get(params, 'repository.full_name'),
      }, _.isUndefined)

      const result = await db
        .select(
          'c.*',
          `r.id as ${REPO_PREFIX}id`,
          `r.full_name as ${REPO_PREFIX}full_name`,
          `r.owner as ${REPO_PREFIX}owner`,
          `r.description as ${REPO_PREFIX}description`,
          `r.html_url as ${REPO_PREFIX}html_url`,
          `r.language as ${REPO_PREFIX}language`,
          `r.stargazers_count as ${REPO_PREFIX}stargazers_count`,
          `u.id as ${USER_PREFIX}id`,
          `u.login as ${USER_PREFIX}login`,
          `u.avatar_url as ${USER_PREFIX}avatarUrl`,
          `u.html_url as ${USER_PREFIX}htmlUrl`,
          `u.type as ${USER_PREFIX}type`,
        )
        .from(`${tableName} AS c`)
        .where(condition)
        .join(`${userTableName} AS u`, 'c.user', '=', 'u.id')
        .join(`${repoTableName} AS r`, 'c.repository', '=', 'r.id')

      return result.map((entity) => {
        const userReplaced = replaceWithPrefix(entity, USER_PREFIX, 'user')
        const repoReplaced = replaceWithPrefix(userReplaced, REPO_PREFIX, 'repository')

        return repoReplaced
      })
    } catch (e) {
      return logger.error(`There are some validation errors when read ${tableName}`, e)
    }
  },

  async insert(params) {
    try {
      Joi.attempt(params, ContributionSchema)

      const { repository, user, lineCount } = params

      return await db(tableName).insert({
        repository,
        user,
        line_count: lineCount
      }).returning('*')
    } catch (e) {
      return logger.error(`There are some validation errors when insert ${tableName}`, e)
    }
  },

  async insertOrReplace(params) {
    try {
      Joi.attempt(params, ContributionSchema)

      const { repository, user, lineCount } = params

      return await db.raw(
        `INSERT INTO ${tableName} (repository, "user", line_count) VALUES (${repository}, ${user}, ${lineCount}) ` +
        `ON CONFLICT (repository, "user") DO UPDATE SET line_count=${lineCount} ` +
        'RETURNING *'
      )
    } catch (e) {
      return logger.error('There are some validation errors when insert Contribution', e)
    }
  }
}

module.exports.Contribution = Contribution
module.exports.ContributionSchema = ContributionSchema
module.exports.ReadSchema = ReadSchema
module.exports.tableName = tableName
