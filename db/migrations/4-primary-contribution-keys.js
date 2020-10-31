'use strict'

const tableName = 'contribution'

function up(knex) {
  return knex.schema.alterTable(tableName, (t) => {
    t.unique(['user', 'repository'])
  })
}

function down(knex) {
  return knex.schema.alterTable(tableName, (t) => {
    t.dropUnique(['user', 'repository'])
  })
}

module.exports = {
  up,
  down
}
