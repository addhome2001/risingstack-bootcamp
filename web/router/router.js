'use strict'

const Router = require('koa-router')
const { getContributors, searchRepositories } = require('../models/github')

const router = new Router()

router.get('/hello', (ctx) => {
  ctx.body = 'Hello Node.js!'
})

router.get('/get/contributors', async (ctx) => {
  const contributors = await getContributors('octocat/hello-world').then((response) => response.json())
  ctx.body = contributors
})

router.get('/search/repositories', async (ctx) => {
  const repositories = await searchRepositories({ q: 'languages:javascript' }).then((res) => res.json())
  ctx.body = repositories
})

module.exports = router
