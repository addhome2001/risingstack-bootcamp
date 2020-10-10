'use strict'

const fetch = require('node-fetch')
const qs = require('query-string')

const config = require('../../config')

/**
 * query:
 *   q<string>: The query contains one or more search keywords and qualifiers.
 *              Qualifiers allow you to limit your search to specific areas of GitHub.
 *              The REST API supports the same qualifiers as GitHub.com.
 *              To learn more about the format of the query, see Constructing a search query.
 *              See "Searching for repositories" for a detailed list of qualifiers.
 *   sort<string>: Sorts the results of your query by number of stars, forks,
 *                 or help-wanted-issues or how recently the items were updated.
 *                 Default: best match
 *   order<string>: Determines whether the first search result returned is the highest number of matches (desc),
 *                  or lowest number of matches (asc).
 *                  This parameter is ignored unless you provide sort.
 *   per_page<integer> Results per page (max 100)
 *   page<integer> Page number of the results to fetch
 */
const searchRepositories = (query = {}) => {
  const stringifyUrl = qs.stringifyUrl({
    url: `${config.githubApi}/search/repositories`,
    query,
  })

  return fetch(stringifyUrl, {
    headers: {
      Authorization: `bearer ${config.githubAccessToken}`,
      Accept: 'application/vnd.github.v3+json',
    }
  })
}

module.exports = searchRepositories
