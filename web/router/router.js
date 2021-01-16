'use strict'

const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const Router = require('koa-router')
const _ = require('lodash')
const { healthCheck: dbHealthCheck } = require('../../db')
const { Repository } = require('../models/Repository')
const { Contribution } = require('../models/Contribution')

const router = new Router()

router.post('/api/v1/trigger', (ctx) => {
  const { query } = _.get(ctx, 'request.body', {})

  if (!query) {
    ctx.status = 400
    ctx.body = {
      message: 'Validation Failed',
      errors: [{
        field: 'query',
        message: 'Query cannot be blank'
      }]
    }
  }

  try {
    exec(`NODE_ENV=${process.env.NODE_ENV} TRIGGER_QUERY=${query} yarn trigger`)
    ctx.status = 201
    ctx.body = {
      message: 'Triggered workers successfully'
    }
  } catch (e) {
    ctx.status = 500
    ctx.body = {
      message: 'Internal Server Error'
    }
  }
})

router.get('/api/v1/repository/:id', async (ctx) => {
  const { id } = ctx.params || {}

  try {
    const repository = await Repository.read({ id })
    ctx.body = repository
  } catch (e) {
    ctx.status = 500
    ctx.body = {
      message: 'Internal Server Error'
    }
  }
})

router.get('/api/v1/repository/:id/contributions', async (ctx) => {
  const { id } = ctx.params || {}

  try {
    const contributions = await Contribution.read({
      repository: { id }
    })
    ctx.body = contributions
  } catch (e) {
    ctx.status = 500
    ctx.body = {
      message: 'Internal Server Error'
    }
  }
})

router.get('/api/v1/repository/:owner/:name', async (ctx) => {
  const { owner, name } = ctx.params || {}

  try {
    const repository = await Repository.read({
      fullName: `${owner}/${name}`
    })
    ctx.body = repository
  } catch (e) {
    ctx.status = 500
    ctx.body = {
      message: 'Internal Server Error'
    }
  }
})

router.get('/api/v1/repository/:owner/:name/contributions', async (ctx) => {
  const { owner, name } = ctx.params || {}

  try {
    const contributions = await Contribution.read({
      repository: { fullName: `${owner}/${name}` }
    })
    ctx.body = contributions
  } catch (e) {
    ctx.status = 500
    ctx.body = {
      message: 'Internal Server Error'
    }
  }
})

router.get('/healthz', async (ctx) => {
  if (ctx.isShutdown) {
    ctx.status = 503
    ctx.body = { status: 'isShutdown' }
  } else {
    try {
      await dbHealthCheck()
      ctx.body = { status: 'ok' }
    } catch (e) {
      ctx.status = 500
      ctx.body = { status: 'failed', message: e.message }
    }
  }
})

module.exports = router
