'use strict'

const fetch = require('node-fetch')
const qs = require('query-string')

const config = require('../../config')

const getContributors = (repository = '', query = {}) => {
  if (!repository) throw Error('getContributors need a repository parameter')

  const stringifyUrl = qs.stringifyUrl({
    url: `${config.githubApi}/repos/${repository}/stats/contributors`,
    query,
  })

  return fetch(stringifyUrl, {
    headers: {
      Authorization: `bearer ${config.githubAccessToken}`,
      Accept: 'application/vnd.github.v3+json',
    }
  })
}

module.exports = getContributors
