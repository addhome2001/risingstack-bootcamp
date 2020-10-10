'use strict'

const { expect } = require('chai')
const nock = require('nock')

const getContributors = require('./getContributors')
const config = require('../../config')

const mockedResult = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
]

describe('model: github/getContributors', () => {
  beforeEach(() => {
    nock(config.githubApi)
      .get('/repos/fakeUser/fakeRepo/stats/contributors')
      .query({
        per_page: 3
      })
      .reply(200, mockedResult)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('Get contributors with repository and query', async () => {
    const response = await getContributors('fakeUser/fakeRepo', { per_page: 3 })
    const result = await response.json()

    expect(result).to.eql(mockedResult)
  })
})
