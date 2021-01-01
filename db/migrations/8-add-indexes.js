'use strict'

async function up(knex) {
  await knex.raw('CREATE INDEX idx_users_login ON users(login)')
  await knex.raw('CREATE INDEX idx_repository_full_name ON repository(full_name)')
}

async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_users_login')
  await knex.raw('DROP INDEX IF EXISTS idx_repository_full_name')
}

module.exports = {
  up,
  down
}
