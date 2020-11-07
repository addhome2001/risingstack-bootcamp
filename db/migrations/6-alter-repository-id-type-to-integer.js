'use strict'

async function up(knex) {
  // Drop constraint
  await knex.raw('ALTER TABLE contribution DROP CONSTRAINT contribution_repository_foreign')

  // Alter column
  await knex.raw('ALTER TABLE repository ALTER COLUMN id TYPE INT')
  await knex.raw('ALTER TABLE contribution ALTER COLUMN repository TYPE INT')

  // Add constraint
  await knex.raw(
    'ALTER TABLE contribution ADD CONSTRAINT contribution_repository_foreign ' +
    'FOREIGN KEY (repository) REFERENCES repository(id)'
  )
}

async function down(knex) {
  // Drop constraint
  await knex.raw('ALTER TABLE contribution DROP CONSTRAINT contribution_repository_foreign')

  await knex.raw('ALTER TABLE repository ALTER COLUMN id TYPE INT2')
  await knex.raw('ALTER TABLE contribution ALTER COLUMN repository TYPE INT2')

  await knex.raw(
    'ALTER TABLE contribution ADD CONSTRAINT contribution_repository_foreign ' +
    'FOREIGN KEY (repository) REFERENCES repository(id)'
  )
}

module.exports = {
  up,
  down
}
