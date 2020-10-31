'use strict'

const Joi = require('joi')
const logger = require('winston')
const db = require('../../db')

const ReadSchema = Joi.object({
  id: Joi.number().integer(),
  login: Joi.string(),
})

const UserSchema = Joi.object({
  id: Joi.number().integer(),
  login: Joi.string(),
  avatarUrl: Joi.string().uri(),
  htmlUrl: Joi.string().uri(),
  type: Joi.string(),
})

const tableName = 'users'

const User = {
  async read(params) {
    try {
      Joi.attempt(params, ReadSchema.or('id', 'login'))

      const findUserQueryBuilder = (queryBuilder, { id, login }) => {
        if (id) return queryBuilder.where({ id })
        if (login) return queryBuilder.where({ login })

        return false
      }

      return await db
        .select('*')
        .from(tableName)
        .modify(findUserQueryBuilder, params)
    } catch (e) {
      return logger.error(`There are some validation errors when read ${tableName}`, e)
    }
  },

  async insert(user) {
    try {
      Joi.attempt(user, UserSchema.length(5))

      const { id, login, avatarUrl, htmlUrl, type } = user

      return await db(tableName).insert({
        id,
        login,
        avatar_url: avatarUrl,
        html_url: htmlUrl,
        type,
      }).returning('*')
    } catch (e) {
      return logger.error(`There are some validation errors when insert ${tableName}`, e)
    }
  },
}

module.exports.User = User
module.exports.UserSchema = UserSchema
module.exports.ReadSchema = ReadSchema
module.exports.tableName = tableName

