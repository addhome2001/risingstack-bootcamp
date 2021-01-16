'use strict'

const http = require('http')
const { promisify } = require('util')
const logger = require('winston')
const config = require('./config')
const server = http.createServer(require('./server').callback())
const db = require('../db')
const gracefulShutdown = require('../helpers/gracefulShutdown')

const serverListen = promisify(server.listen).bind(server)
const serverClose = promisify(server.close).bind(server)

serverListen(config.port)
  .then(() => logger.info(`Server is listening on port ${config.port}`))
  .catch((err) => {
    logger.error('Error happened during server start', err)
    process.exit(1)
  })

process.on('SIGTERM', async () => {
  await gracefulShutdown({ serverClose, destroyDB: db.destroy })
  server.context.isShutdown = true
})
