'use strict'

const Joi = require('joi')
const replaceWithPrefix = require('./utils/replaceWithPrefix')
const { tableName: userTableName } = require('./User')
const db = require('../../db')
const ValidationError = require('./ValidationError')

const ReadSchema = Joi.object({
  id: Joi.number().integer(),
  fullName: Joi.string(),
})

const RepositorySchema = Joi.object({
  id: Joi.number().integer(),
  fullName: Joi.string(),
  owner: Joi.number().integer(),
  description: Joi.string(),
  htmlUrl: Joi.string().uri(),
  language: Joi.string(),
  stargazersCount: Joi.number().integer(),
})

const tableName = 'repository'

const Repository = {
  async read(params) {
    try {
      Joi.attempt(params, ReadSchema.or('id', 'fullName'))
    } catch (e) {
      throw new ValidationError(`There are some validation errors when read ${tableName}: ${e.message}`)
    }

    const PREFIX = '__OWNER_PREFIX__'
    const { id, fullName } = params
    const [repo] = await db
      .select(
        'repo.*',
        `u.id as ${PREFIX}id`,
        `u.login as ${PREFIX}login`,
        `u.avatar_url as ${PREFIX}avatar`,
        `u.html_url as ${PREFIX}html_ur`,
        `u.type as ${PREFIX}type`,
      )
      .from(`${tableName} AS repo`)
      .modify((qb) => {
        if (id) return qb.where({ 'repo.id': id })
        if (fullName) return qb.where({ full_name: fullName })

        return false
      })
      .join(`${userTableName} AS u`, 'repo.owner', '=', 'u.id')

    return replaceWithPrefix(repo, PREFIX, 'owner')
  },

  async insert(repo) {
    try {
      if (!repo.id) throw new ValidationError(`ID field is required when insert ${tableName}`)

      Joi.attempt(repo, RepositorySchema.and(
        'id',
        'owner',
        'fullName',
        'htmlUrl',
        'stargazersCount'
      ))
    } catch (e) {
      throw new ValidationError(`There are some validation errors when insert ${tableName}: ${e.message}`)
    }

    const {
      id,
      owner,
      fullName,
      description = '',
      htmlUrl,
      language = '',
      stargazersCount
    } = repo

    await db(tableName).insert({
      id,
      owner,
      description,
      html_url: htmlUrl,
      full_name: fullName,
      language,
      stargazers_count: stargazersCount
    }).returning('*')
  },
}

module.exports.Repository = Repository
module.exports.RepositorySchema = RepositorySchema
module.exports.ReadSchema = ReadSchema
module.exports.tableName = tableName
