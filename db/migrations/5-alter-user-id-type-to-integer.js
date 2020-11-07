'use strict'

async function up(knex) {
  // Drop constraint
  await knex.raw('ALTER TABLE repository DROP CONSTRAINT repository_owner_foreign')
  await knex.raw('ALTER TABLE contribution DROP CONSTRAINT contribution_user_foreign')

  // Alter column
  await knex.raw('ALTER TABLE repository ALTER COLUMN owner TYPE INT')
  await knex.raw('ALTER TABLE users ALTER COLUMN id TYPE INT')
  await knex.raw('ALTER TABLE contribution ALTER COLUMN "user" TYPE INT')

  // Add constraint
  await knex.raw(
    'ALTER TABLE repository ADD CONSTRAINT repository_owner_foreign FOREIGN KEY (owner) REFERENCES users(id)'
  )
  await knex.raw(
    'ALTER TABLE contribution ADD CONSTRAINT contribution_user_foreign FOREIGN KEY ("user") REFERENCES users(id)'
  )
}

async function down(knex) {
  // Drop constraint
  await knex.raw('ALTER TABLE repository DROP CONSTRAINT repository_owner_foreign')
  await knex.raw('ALTER TABLE contribution DROP CONSTRAINT contribution_user_foreign')

  await knex.raw('ALTER TABLE contribution ALTER COLUMN "user" TYPE INT2')
  await knex.raw('ALTER TABLE repository ALTER COLUMN owner TYPE INT2')
  await knex.raw('ALTER TABLE users ALTER COLUMN id TYPE INT2')

  await knex.raw(
    'ALTER TABLE repository ADD CONSTRAINT repository_owner_foreign FOREIGN KEY (owner) REFERENCES users(id)'
  )
  await knex.raw(
    'ALTER TABLE contribution ADD CONSTRAINT contribution_user_foreign FOREIGN KEY ("user") REFERENCES users(id)'
  )
}

module.exports = {
  up,
  down
}
