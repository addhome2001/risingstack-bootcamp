'use strict'

const Koa = require('koa')
const logger = require('winston')
const bodyParser = require('koa-bodyparser')
const requestLogger = require('./middlewares/requestLogger')
const router = require('./router')

const app = new Koa()

app.use(bodyParser())
app.use(requestLogger())
app.use(router.routes()).use(router.allowedMethods())

app.on('error', (err) => {
  logger.error('Server error', { error: err.message })
})

module.exports = app
