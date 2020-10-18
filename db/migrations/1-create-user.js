'use strict'

const tableName = 'users'

function up(knex) {
  return knex.schema.createTable(tableName, (table) => {
    table.specificType('id', 'smallint').primary().unique().notNullable()
    table.string('login', 255).notNullable()
    table.string('avatar_url', 255).notNullable()
    table.string('html_url', 255).notNullable()
    table.string('type', 255).notNullable()
  })
}

function down(knex) {
  return knex.schema.dropTableIfExists(tableName)
}

module.exports = {
  up,
  down
}
