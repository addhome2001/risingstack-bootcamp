'use strict'

const { execSync } = require('child_process')
const logger = require('winston')

try {
  const stdout = execSync('knex migrate:latest')
  logger.info(stdout.toString())
} catch (e) {
  logger.error(`Migration Error: ${e}`)
}
