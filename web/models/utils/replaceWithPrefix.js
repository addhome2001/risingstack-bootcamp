'use strict'

const _ = require('lodash')

function replaceWithPrefix(source, prefix, replacedKey) {
  return _.reduce(_.omit(source, [replacedKey]), (acc, value, key) => {
    if (_.startsWith(key, prefix)) {
      const keyWithoutPrefix = _.replace(key, prefix, '')
      _.set(acc, `${replacedKey}[${keyWithoutPrefix}]`, value)
    } else {
      acc[key] = value
    }

    return acc
  }, {})
}

module.exports = replaceWithPrefix
