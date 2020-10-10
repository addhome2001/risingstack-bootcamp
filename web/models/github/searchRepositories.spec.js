'use strict'

const { expect } = require('chai')
const nock = require('nock')

const searchRepositories = require('./searchRepositories')
const config = require('../../config')

const mockedResult = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
]

describe('model: github/searchRepositories', () => {
  beforeEach(() => {
    nock(config.githubApi)
      .get('/search/repositories')
      .query({
        q: 'languages:javascript'
      })
      .reply(200, mockedResult)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('Search repositories with query', async () => {
    const response = await searchRepositories({ q: 'languages:javascript' })
    const result = await response.json()

    expect(result).to.eql(mockedResult)
  })
})
