'use strict'

const logger = require('winston')
const _ = require('lodash')

module.exports = ({ defaultLevel = 'info' } = {}) => async (ctx, next) => {
  const startTime = Date.now()

  await next()

  const endTime = Date.now()

  let level = defaultLevel

  const { status, request, response, method, originalUrl } = ctx

  if (status >= 500) level = 'error'
  if (status < 500 && status >= 400) level = 'warn'

  const requestInfo = {
    method,
    originalUrl,
    requestDuration: endTime - startTime,
    statusCode: status,
    request: {
      header: _.omit(request.header, ['authorization', 'cookie']),
      ...(!_.isEmpty(request.body) ? { body: request.body } : {}),
    },
    response: {
      header: _.omit(response.header, ['authorization', 'cookie']),
      body: _.get(ctx, 'body', {}),
    }
  }

  logger.log(level, `Received request: ${JSON.stringify(requestInfo, null, 2)}`)
}
