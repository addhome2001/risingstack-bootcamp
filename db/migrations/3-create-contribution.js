'use strict'

const tableName = 'contribution'

function up(knex) {
  return knex.schema.createTable(tableName, (table) => {
    table.specificType('user', 'smallint').notNullable()
    table.foreign('user').references('users.id')

    table.specificType('repository', 'smallint').notNullable()
    table.foreign('repository').references('repository.id')

    table.specificType('line_count', 'smallint').notNullable()
  })
}

function down(knex) {
  return knex.schema.dropTableIfExists(tableName)
}

module.exports = {
  up,
  down
}
