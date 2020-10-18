'use strict'

const tableName = 'repository'

function up(knex) {
  return knex.schema.createTable(tableName, (table) => {
    table.specificType('id', 'smallint').primary().unique().notNullable()

    table.specificType('owner', 'smallint').notNullable()
    table.foreign('owner').references('users.id')

    table.string('full_name', 255).notNullable()
    table.string('description', 255).notNullable()
    table.string('html_url', 255).notNullable()
    table.string('language', 255).notNullable()
    table.specificType('stargazers_count', 'smallint').notNullable()
  })
}

function down(knex) {
  return knex.schema.dropTableIfExists(tableName)
}

module.exports = {
  up,
  down
}
