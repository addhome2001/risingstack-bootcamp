'use strict'

const Koa = require('koa')
const http = require('http')
const { promisify } = require('util')
const logger = require('winston')
const Router = require('koa-router')
const requestLogger = require('../web/middlewares/requestLogger')
const gracefulShutdown = require('../helpers/gracefulShutdown')

const createHealthCheckServer = ({ port = 3001, healthCheckRedisClients, destroyRedisClients }) => {
  // Router
  const router = new Router()

  router.get('/healthz', async (ctx) => {
    if (ctx.isShutdown) {
      ctx.status = 503
      ctx.body = { status: 'isShutdown' }
    } else {
      try {
        await healthCheckRedisClients()
        ctx.body = { status: 'ok' }
      } catch (e) {
        ctx.status = 500
        ctx.body = { status: 'failed', message: e.message }
      }
    }
  })

  // App
  const app = new Koa()

  app.use(requestLogger())
  app.use(router.routes()).use(router.allowedMethods())
  app.on('error', (err) => {
    logger.error('Server error', { error: err.message })
  })

  const server = http.createServer(app.callback())
  const serverListen = promisify(server.listen).bind(server)
  const serverClose = promisify(server.close).bind(server)

  serverListen(port)
    .then(() => logger.info(`Server is listening on port ${port}`))
    .catch((err) => {
      logger.error('Error happened during server start', err)
      process.exit(1)
    })

  process.on('SIGTERM', async () => {
    await gracefulShutdown({ serverClose, destroyRedis: destroyRedisClients })
    server.context.isShutdown = true
  })

  return server
}

module.exports = createHealthCheckServer
