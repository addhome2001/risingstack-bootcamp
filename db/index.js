'use strict'
const waitForTimeout = require('../utils/waitForTimeout')

const env = process.env.NODE_ENV || 'development'
const healthCheckTimeout = process.env.PG_HEALTH_CHECK_TIMEOUT || 2000
const knexfile = require('../knexfile')
const db = require('knex')(knexfile[env])

const healthCheck = () =>
  Promise.race([
    waitForTimeout(healthCheckTimeout),
    db.raw('SELECT 1 + 1 AS result')
  ])

module.exports = db
module.exports.healthCheck = healthCheck
