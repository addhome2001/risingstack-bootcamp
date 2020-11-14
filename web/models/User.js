'use strict'

const Joi = require('joi')
const db = require('../../db')
const ValidationError = require('./ValidationError')

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
    } catch (e) {
      throw new ValidationError(`There are some validation errors when read ${tableName}: ${e.message}`)
    }

    const findUserQueryBuilder = (queryBuilder, { id, login }) => {
      if (id) return queryBuilder.where({ id })
      if (login) return queryBuilder.where({ login })

      return false
    }

    await db
      .select('*')
      .from(tableName)
      .modify(findUserQueryBuilder, params)
  },

  async insert(user) {
    try {
      Joi.attempt(user, UserSchema.length(5))
    } catch (e) {
      throw new ValidationError(`There are some validation errors when insert ${tableName}: ${e.message}`)
    }

    const { id, login, avatarUrl, htmlUrl, type } = user

    await db(tableName).insert({
      id,
      login,
      avatar_url: avatarUrl,
      html_url: htmlUrl,
      type,
    }).returning('*')
  },
}

module.exports.User = User
module.exports.UserSchema = UserSchema
module.exports.ReadSchema = ReadSchema
module.exports.tableName = tableName

