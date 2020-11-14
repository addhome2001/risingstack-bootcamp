'use strict'

const Router = require('koa-router')
const { getContributors, searchRepositories } = require('../models/github')
const { User } = require('../models/User')
const { Repository } = require('../models/Repository')
const { Contribution } = require('../models/Contribution')

const router = new Router()

router.get('/insert', async (ctx) => {
  const user = await User.insert({
    id: 124,
    login: 'login',
    avatarUrl: 'https://google.com',
    htmlUrl: 'https://google.com',
    type: 'oauth'
  })

  ctx.body = user
})

router.get('/read', async (ctx) => {
  const user = await User.read({
    id: 124
  })

  ctx.body = user
})

router.get('/insert/repo', async (ctx) => {
  const repository = await Repository.insert({
    id: 446,
    owner: 123,
    fullName: 'Mock Repo',
    htmlUrl: 'http://www.google.com',
    stargazersCount: 12
  })

  ctx.body = repository
})

router.get('/read/repo', async (ctx) => {
  const repository = await Repository.read({
    id: 444
  })

  ctx.body = repository
})

router.get('/read/contribution', async (ctx) => {
  const contribution = await Contribution.read({
    user: {
      id: 123
    },
    repository: {
      id: 444
    }
  })

  ctx.body = contribution
})

router.get('/insert/contribution', async (ctx) => {
  const contribution = await Contribution.insertOrReplace({
    repository: 446,
    user: 124,
    lineCount: 12
  })

  ctx.body = contribution
})

router.get('/get/contributors', async (ctx) => {
  const contributors = await getContributors('naptha/tesseract.js').then((response) => response.json())
  ctx.body = contributors
})

router.get('/search/repositories', async (ctx) => {
  const repositories = await searchRepositories({ q: 'languages:javascript' }).then((res) => res.json())
  ctx.body = repositories
})

module.exports = router
