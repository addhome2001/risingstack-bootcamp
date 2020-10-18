'use strict'

const path = require('path')

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
    migrations: {
      directory: path.join(__dirname, './db/migrations')
    }
  },
}
