'use strict'

async function up(knex) {
  await knex.raw('ALTER TABLE contribution ALTER COLUMN line_count TYPE INT')
}

async function down(knex) {
  await knex.raw('ALTER TABLE contribution ALTER COLUMN line_count TYPE INT2')
}

module.exports = {
  up,
  down
}
